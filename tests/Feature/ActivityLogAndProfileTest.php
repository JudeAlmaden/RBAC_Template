<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ActivityLogAndProfileTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_super_admin_can_access_activity_logs_index(): void
    {
        $superAdmin = User::where('email', 'superadmin@example.com')->first();

        $response = $this->actingAs($superAdmin)->get(route('activity-logs.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('ActivityLogs/Index')
            ->has('logs')
            ->has('metrics')
            ->has('availableActions')
        );
    }

    public function test_admin_with_view_logs_can_access_activity_logs_index(): void
    {
        $admin = User::where('email', 'admin@example.com')->first();

        $response = $this->actingAs($admin)->get(route('activity-logs.index'));

        $response->assertOk();
    }

    public function test_basic_user_cannot_access_activity_logs_index(): void
    {
        $user = User::where('email', 'user@example.com')->first();

        $response = $this->actingAs($user)->get(route('activity-logs.index'));

        $response->assertForbidden();
    }

    public function test_activity_logs_export_streams_csv(): void
    {
        $superAdmin = User::where('email', 'superadmin@example.com')->first();

        $response = $this->actingAs($superAdmin)->get(route('activity-logs.export'));

        $response->assertOk();
        $this->assertStringContainsString('text/csv', (string) $response->headers->get('content-type'));
    }

    public function test_admin_can_view_user_profile(): void
    {
        $admin = User::where('email', 'admin@example.com')->first();
        $basicUser = User::where('email', 'user@example.com')->first();

        $response = $this->actingAs($admin)->get(route('users.show', $basicUser->id));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Users/Show')
            ->has('profileUser')
            ->has('logsBy')
            ->has('logsOn')
            ->has('metrics')
        );
    }

    public function test_basic_user_cannot_view_other_user_profile(): void
    {
        $basicUser = User::where('email', 'user@example.com')->first();
        $admin = User::where('email', 'admin@example.com')->first();

        $response = $this->actingAs($basicUser)->get(route('users.show', $admin->id));

        $response->assertForbidden();
    }

    public function test_user_can_view_own_profile(): void
    {
        $basicUser = User::where('email', 'user@example.com')->first();

        $response = $this->actingAs($basicUser)->get(route('users.show', $basicUser->id));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Users/Show')
            ->where('profileUser.id', $basicUser->id)
        );
    }
}
