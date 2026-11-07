<?php

namespace Tests\Feature;

use App\Models\User;
use App\Notifications\AccountInvitation;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class AdminSetupLinkTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_a_super_admin_can_force_a_password_by_sending_a_setup_link(): void
    {
        Notification::fake();

        $admin = User::where('email', 'superadmin@example.com')->firstOrFail();
        $user = User::where('email', 'user@example.com')->firstOrFail();

        $this->actingAs($admin)
            ->post("/users/{$user->id}/setup-link")
            ->assertRedirect()
            ->assertSessionHas('setup_link');

        $this->assertTrue($user->fresh()->must_change_password);
        Notification::assertSentTo($user, AccountInvitation::class);
    }

    public function test_the_emailed_link_lets_the_user_choose_a_password(): void
    {
        Notification::fake();

        $admin = User::where('email', 'superadmin@example.com')->firstOrFail();
        $user = User::where('email', 'user@example.com')->firstOrFail();

        $this->actingAs($admin)->post("/users/{$user->id}/setup-link");

        Notification::assertSentTo($user, AccountInvitation::class, function ($notification) {
            $this->get($notification->url)->assertOk();

            return true;
        });
    }

    public function test_a_user_cannot_issue_a_setup_link_for_themselves(): void
    {
        $user = User::where('email', 'user@example.com')->firstOrFail();

        $this->actingAs($user)
            ->post("/users/{$user->id}/setup-link")
            ->assertForbidden();

        $this->assertFalse($user->fresh()->must_change_password);
    }

    public function test_a_basic_user_cannot_issue_setup_links_for_others(): void
    {
        $user = User::where('email', 'user@example.com')->firstOrFail();
        $other = User::where('email', 'admin@example.com')->firstOrFail();

        $this->actingAs($user)
            ->post("/users/{$other->id}/setup-link")
            ->assertForbidden();
    }

    public function test_unconfigured_mail_returns_the_link_instead_of_claiming_success(): void
    {
        Notification::fake();
        config(['mail.default' => 'log']);

        $admin = User::where('email', 'superadmin@example.com')->firstOrFail();
        $user = User::where('email', 'user@example.com')->firstOrFail();

        $response = $this->actingAs($admin)->post("/users/{$user->id}/setup-link");

        $response
            ->assertSessionHas('setup_link')
            ->assertSessionHas('setup_link_emailed', false)
            ->assertSessionHas('warning');

        Notification::assertNothingSent();
    }

    public function test_an_admin_cannot_force_a_super_admin_password_reset(): void
    {
        $admin = User::where('email', 'admin@example.com')->firstOrFail();
        $superAdmin = User::where('email', 'superadmin@example.com')->firstOrFail();

        $this->actingAs($admin)
            ->post("/users/{$superAdmin->id}/setup-link")
            ->assertForbidden();

        $this->assertFalse($superAdmin->fresh()->must_change_password);
    }
}
