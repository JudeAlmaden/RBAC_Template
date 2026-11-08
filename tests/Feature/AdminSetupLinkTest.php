<?php

namespace Tests\Feature;

use App\Models\User;
use App\Notifications\AccountInvitation;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminSetupLinkTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_a_super_admin_can_send_a_setup_link(): void
    {
        Notification::fake();

        $superAdmin = User::where('email', 'superadmin@example.com')->firstOrFail();
        $user = User::where('email', 'user@example.com')->firstOrFail();

        $response = $this->actingAs($superAdmin)
            ->post("/users/{$user->id}/setup-link");

        $response->assertRedirect();
        $response->assertSessionHas('setup_link');
        $response->assertSessionHas('setup_link_emailed', true);

        $this->assertTrue($user->fresh()->must_change_password);
        Notification::assertSentTo($user, AccountInvitation::class);
    }

    public function test_the_emailed_url_opens_the_setup_page(): void
    {
        $superAdmin = User::where('email', 'superadmin@example.com')->firstOrFail();
        $user = User::where('email', 'user@example.com')->firstOrFail();

        $this->actingAs($superAdmin)->post("/users/{$user->id}/setup-link");

        $setupLink = session('setup_link');
        $this->assertNotEmpty($setupLink);

        $response = $this->get($setupLink);

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Onboarding/Show')
            ->where('email', $user->email)
        );
    }

    public function test_a_user_cannot_issue_a_link_for_themselves(): void
    {
        $user = User::where('email', 'user@example.com')->firstOrFail();

        $response = $this->actingAs($user)
            ->post("/users/{$user->id}/setup-link");

        $response->assertForbidden();
        $this->assertFalse($user->fresh()->must_change_password);
    }

    public function test_a_basic_user_cannot_issue_a_link_for_someone_else(): void
    {
        $user = User::where('email', 'user@example.com')->firstOrFail();
        $other = User::where('email', 'admin@example.com')->firstOrFail();

        $response = $this->actingAs($user)
            ->post("/users/{$other->id}/setup-link");

        $response->assertForbidden();
        $this->assertFalse($other->fresh()->must_change_password);
    }

    public function test_an_admin_cannot_force_a_super_admin_reset(): void
    {
        $admin = User::where('email', 'admin@example.com')->firstOrFail();
        $superAdmin = User::where('email', 'superadmin@example.com')->firstOrFail();

        $response = $this->actingAs($admin)
            ->post("/users/{$superAdmin->id}/setup-link");

        $response->assertForbidden();
        $this->assertFalse($superAdmin->fresh()->must_change_password);
    }

    public function test_a_non_delivering_mailer_flashes_the_link_with_a_warning(): void
    {
        config(['mail.default' => 'log']);
        Notification::fake();

        $superAdmin = User::where('email', 'superadmin@example.com')->firstOrFail();
        $user = User::where('email', 'user@example.com')->firstOrFail();

        $response = $this->actingAs($superAdmin)
            ->post("/users/{$user->id}/setup-link");

        $response->assertSessionHas('setup_link');
        $response->assertSessionHas('setup_link_emailed', false);
        $response->assertSessionHas('warning');

        Notification::assertNothingSent();
    }
}
