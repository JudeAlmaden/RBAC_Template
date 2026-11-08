<?php

namespace Tests\Feature;

use App\Models\User;
use App\Notifications\AccountInvitation;
use App\Support\SetupLink;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class OnboardingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    private function invitedUser(array $attributes = []): User
    {
        return User::factory()->create([
            'email_verified_at' => null,
            'password' => Str::random(40),
            'must_change_password' => true,
            ...$attributes,
        ]);
    }

    public function test_creating_an_account_without_a_password_emails_a_setup_link(): void
    {
        Notification::fake();

        $admin = User::where('email', 'admin@example.com')->firstOrFail();

        $response = $this->actingAs($admin)->post('/users', [
            'name' => 'Invited Person',
            'email' => 'invited@example.com',
            'role' => 'user',
        ]);

        $response->assertRedirect('/users');
        $response->assertSessionHas('setup_link');
        $response->assertSessionHas('success');

        $invited = User::where('email', 'invited@example.com')->firstOrFail();

        $this->assertTrue($invited->must_change_password);
        $this->assertNotEmpty($invited->password);
        Notification::assertSentTo($invited, AccountInvitation::class);
    }

    public function test_the_signed_url_renders_the_setup_page(): void
    {
        $user = $this->invitedUser(['name' => 'Invited Person']);

        $response = $this->get(SetupLink::showUrlFor($user));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Onboarding/Show')
            ->where('name', 'Invited Person')
            ->where('email', $user->email)
            ->has('submitUrl')
        );
    }

    public function test_a_link_with_the_wrong_hash_redirects_to_login(): void
    {
        $user = $this->invitedUser();

        $url = URL::temporarySignedRoute('onboarding.show', now()->addHour(), [
            'user' => $user->id,
            'hash' => sha1('not-the-right-hash'),
        ]);

        $response = $this->get($url);

        $response->assertRedirect(route('login'));
        $response->assertSessionHas('error');
    }

    public function test_a_link_is_rejected_after_seventy_three_hours(): void
    {
        $user = $this->invitedUser();
        $url = SetupLink::showUrlFor($user);

        $this->travel(73)->hours();

        $this->get($url)->assertForbidden();
    }

    public function test_posting_a_password_signs_the_user_in(): void
    {
        $user = $this->invitedUser([
            'name' => 'Invited Person',
            'email' => 'invited@example.com',
            'email_verified_at' => null,
        ]);

        $response = $this->post(SetupLink::storeUrlFor($user, now()->addHours(72)), [
            'password' => 'brand-new-password',
            'password_confirmation' => 'brand-new-password',
        ]);

        $response->assertRedirect('/dashboard');
        $response->assertSessionHasNoErrors();
        $this->assertAuthenticatedAs($user);

        $user->refresh();
        $this->assertFalse($user->must_change_password);
        $this->assertNotNull($user->email_verified_at);
    }

    public function test_a_short_password_fails_validation_and_keeps_the_flag(): void
    {
        $user = $this->invitedUser();

        $response = $this->post(SetupLink::storeUrlFor($user, now()->addHours(72)), [
            'password' => 'short12',
            'password_confirmation' => 'short12',
        ]);

        $response->assertSessionHasErrors('password');
        $this->assertGuest();
        $this->assertTrue($user->fresh()->must_change_password);
    }

    public function test_a_used_link_redirects_to_login(): void
    {
        $user = $this->invitedUser(['must_change_password' => false]);
        $url = SetupLink::showUrlFor($user);

        $response = $this->get($url);

        $response->assertRedirect(route('login'));
        $response->assertSessionHas('status');
    }

    public function test_a_deactivated_account_can_set_a_password_but_is_not_signed_in(): void
    {
        $user = $this->invitedUser(['is_active' => false]);

        $response = $this->post(SetupLink::storeUrlFor($user, now()->addHours(72)), [
            'password' => 'brand-new-password',
            'password_confirmation' => 'brand-new-password',
        ]);

        $response->assertRedirect(route('login'));
        $this->assertGuest();
        $this->assertFalse($user->fresh()->must_change_password);
    }

    public function test_creating_an_account_with_a_password_skips_the_invitation(): void
    {
        Notification::fake();

        $admin = User::where('email', 'admin@example.com')->firstOrFail();

        $response = $this->actingAs($admin)->post('/users', [
            'name' => 'Direct Person',
            'email' => 'direct@example.com',
            'password' => 'existing-password',
            'role' => 'user',
        ]);

        $response->assertRedirect('/users');
        $response->assertSessionMissing('setup_link');

        $direct = User::where('email', 'direct@example.com')->firstOrFail();

        $this->assertFalse($direct->must_change_password);
        Notification::assertNotSentTo($direct, AccountInvitation::class);
    }

    public function test_a_non_delivering_mailer_flashes_the_link_instead_of_claiming_delivery(): void
    {
        config(['mail.default' => 'log']);
        Notification::fake();

        $admin = User::where('email', 'admin@example.com')->firstOrFail();

        $response = $this->actingAs($admin)->post('/users', [
            'name' => 'Invited Person',
            'email' => 'invited@example.com',
            'role' => 'user',
        ]);

        $response->assertSessionHas('setup_link');
        $response->assertSessionHas('setup_link_emailed', false);
        $response->assertSessionHas('warning');

        Notification::assertNothingSent();
    }

    public function test_a_link_issued_for_one_account_cannot_be_repointed_at_another(): void
    {
        $first = $this->invitedUser();
        $second = $this->invitedUser();

        $url = URL::temporarySignedRoute('onboarding.show', now()->addHour(), [
            'user' => $first->id,
            'hash' => SetupLink::hashFor($second),
        ]);

        $response = $this->get($url);

        $response->assertRedirect(route('login'));
        $response->assertSessionHas('error');
    }
}
