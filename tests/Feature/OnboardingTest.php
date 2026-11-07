<?php

namespace Tests\Feature;

use App\Models\User;
use App\Notifications\AccountInvitation;
use App\Support\SetupLink;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

class OnboardingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    private function superAdmin(): User
    {
        return User::where('email', 'superadmin@example.com')->firstOrFail();
    }

    public function test_creating_an_account_without_a_password_sends_a_setup_link(): void
    {
        Notification::fake();

        $response = $this->actingAs($this->superAdmin())->post('/users', [
            'name' => 'Invited User',
            'email' => 'invited@example.com',
            'role' => 'user',
        ]);

        $response->assertRedirect('/users')->assertSessionHas('setup_link');

        $user = User::where('email', 'invited@example.com')->firstOrFail();

        $this->assertTrue($user->must_change_password);
        $this->assertNotEmpty($user->password);
        Notification::assertSentTo($user, AccountInvitation::class);
    }

    public function test_setup_link_page_can_be_opened_from_the_signed_url(): void
    {
        $user = User::factory()->create(['must_change_password' => true]);

        $this->get(SetupLink::showUrlFor($user))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Onboarding/Show')
                ->where('email', $user->email)
                ->has('submitUrl'));
    }

    public function test_setup_link_rejects_a_tampered_hash(): void
    {
        $user = User::factory()->create(['must_change_password' => true]);

        $url = URL::temporarySignedRoute('onboarding.show', now()->addHour(), [
            'user' => $user->id,
            'hash' => 'not-the-right-hash',
        ]);

        $this->get($url)
            ->assertRedirect(route('login'))
            ->assertSessionHas('error');
    }

    public function test_setup_link_rejects_an_expired_signature(): void
    {
        $user = User::factory()->create(['must_change_password' => true]);
        $url = SetupLink::showUrlFor($user);

        $this->travel(73)->hours();

        $this->get($url)->assertForbidden();
    }

    public function test_user_can_set_a_password_from_the_setup_link(): void
    {
        $user = User::factory()->create([
            'must_change_password' => true,
            'email_verified_at' => null,
        ]);

        $this->post(SetupLink::storeUrlFor($user, now()->addHour()), [
            'password' => 'a-strong-password',
            'password_confirmation' => 'a-strong-password',
        ])->assertRedirect(route('dashboard'));

        $user->refresh();

        $this->assertAuthenticatedAs($user);
        $this->assertFalse($user->must_change_password);
        $this->assertTrue(Hash::check('a-strong-password', $user->password));
        $this->assertNotNull($user->email_verified_at);
    }

    public function test_setup_password_must_meet_the_policy(): void
    {
        $user = User::factory()->create(['must_change_password' => true]);

        $this->post(SetupLink::storeUrlFor($user, now()->addHour()), [
            'password' => 'short12',
            'password_confirmation' => 'short12',
        ])->assertSessionHasErrors('password');

        $this->assertTrue($user->fresh()->must_change_password);
        $this->assertGuest();
    }

    public function test_a_used_setup_link_redirects_to_login(): void
    {
        $user = User::factory()->create(['must_change_password' => false]);

        $this->get(SetupLink::showUrlFor($user))
            ->assertRedirect(route('login'))
            ->assertSessionHas('status');
    }

    public function test_a_deactivated_user_can_set_the_password_but_is_not_signed_in(): void
    {
        $user = User::factory()->create([
            'must_change_password' => true,
            'is_active' => false,
        ]);

        $this->post(SetupLink::storeUrlFor($user, now()->addHour()), [
            'password' => 'a-strong-password',
            'password_confirmation' => 'a-strong-password',
        ])->assertRedirect(route('login'));

        $this->assertGuest();
        $this->assertFalse($user->fresh()->must_change_password);
        $this->assertFalse($user->fresh()->is_active);
    }

    public function test_accounts_created_with_a_password_are_not_forced_to_change_it(): void
    {
        Notification::fake();

        $this->actingAs($this->superAdmin())->post('/users', [
            'name' => 'Direct User',
            'email' => 'direct@example.com',
            'password' => 'password123',
            'role' => 'user',
        ])->assertRedirect('/users');

        $user = User::where('email', 'direct@example.com')->firstOrFail();

        $this->assertFalse($user->must_change_password);
        Notification::assertNotSentTo($user, AccountInvitation::class);
    }

    public function test_mail_that_cannot_deliver_falls_back_to_a_copyable_link(): void
    {
        Notification::fake();
        config(['mail.default' => 'log']);

        $response = $this->actingAs($this->superAdmin())->post('/users', [
            'name' => 'No Mail User',
            'email' => 'nomail@example.com',
            'role' => 'user',
        ]);

        $response
            ->assertRedirect('/users')
            ->assertSessionHas('setup_link')
            ->assertSessionHas('setup_link_emailed', false);

        Notification::assertNothingSent();
    }

    public function test_setup_links_are_scoped_to_the_account_they_were_issued_for(): void
    {
        $first = User::factory()->create(['must_change_password' => true]);
        $second = User::factory()->create(['must_change_password' => true]);

        $url = URL::temporarySignedRoute('onboarding.show', now()->addHour(), [
            'user' => $second->id,
            'hash' => SetupLink::hashFor($first),
        ]);

        $this->get($url)->assertRedirect(route('login'));
    }
}
