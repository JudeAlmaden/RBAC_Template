<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserStatusAndRoleLimitTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_deactivated_user_cannot_login(): void
    {
        $user = User::where('email', 'user@example.com')->first();
        $user->is_active = false;
        $user->save();

        $response = $this->post('/login', [
            'email' => 'user@example.com',
            'password' => 'password',
        ]);

        $response->assertSessionHasErrors('email');
        $this->assertGuest();
    }

    public function test_active_user_can_login(): void
    {
        $response = $this->post('/login', [
            'email' => 'user@example.com',
            'password' => 'password',
        ]);

        $response->assertRedirect('/dashboard');
        $this->assertAuthenticated();
    }

    public function test_super_admin_can_toggle_user_status_and_activity_is_logged(): void
    {
        $superAdmin = User::where('email', 'superadmin@example.com')->first();
        $basicUser = User::where('email', 'user@example.com')->first();

        // Deactivate
        $response = $this->actingAs($superAdmin)->patch("/users/{$basicUser->id}/toggle-status");
        $response->assertRedirect('/users');
        $this->assertFalse($basicUser->fresh()->is_active);

        $this->assertDatabaseHas('activity_logs', [
            'actor_id' => $superAdmin->id,
            'action' => 'deactivated_account',
            'subject_id' => $basicUser->id,
            'subject_type' => 'User',
        ]);

        // Reactivate
        $response2 = $this->actingAs($superAdmin)->patch("/users/{$basicUser->id}/toggle-status");
        $response2->assertRedirect('/users');
        $this->assertTrue($basicUser->fresh()->is_active);

        $this->assertDatabaseHas('activity_logs', [
            'actor_id' => $superAdmin->id,
            'action' => 'activated_account',
            'subject_id' => $basicUser->id,
            'subject_type' => 'User',
        ]);
    }

    public function test_user_cannot_deactivate_self(): void
    {
        $superAdmin = User::where('email', 'superadmin@example.com')->first();

        $response = $this->actingAs($superAdmin)->patch("/users/{$superAdmin->id}/toggle-status");

        $response->assertForbidden();
        $this->assertTrue($superAdmin->fresh()->is_active);
    }

    public function test_cannot_deactivate_last_remaining_active_super_admin(): void
    {
        $superAdmin = User::where('email', 'superadmin@example.com')->first();
        $admin = User::where('email', 'admin@example.com')->first();

        // Admin cannot deactivate super admin anyway
        $response = $this->actingAs($admin)->patch("/users/{$superAdmin->id}/toggle-status");
        $response->assertForbidden();

        // Super Admin trying to deactivate self is also forbidden
        $response2 = $this->actingAs($superAdmin)->patch("/users/{$superAdmin->id}/toggle-status");
        $response2->assertForbidden();
    }

    public function test_role_personnel_capacity_limit_enforced_on_user_creation(): void
    {
        $superAdmin = User::where('email', 'superadmin@example.com')->first();

        // Create role with max 1 active user
        $role = Role::create([
            'name' => 'lead_auditor',
            'max_active_users' => 1,
        ]);

        // 1st assignment: succeeds
        $response1 = $this->actingAs($superAdmin)->post('/users', [
            'name' => 'Auditor 1',
            'email' => 'auditor1@example.com',
            'password' => 'password123',
            'role' => 'lead_auditor',
        ]);
        $response1->assertRedirect('/users');

        // 2nd assignment: exceeds capacity
        $response2 = $this->actingAs($superAdmin)->post('/users', [
            'name' => 'Auditor 2',
            'email' => 'auditor2@example.com',
            'password' => 'password123',
            'role' => 'lead_auditor',
        ]);
        $response2->assertSessionHasErrors('role');
    }

    public function test_deactivating_user_frees_up_role_seat(): void
    {
        $superAdmin = User::where('email', 'superadmin@example.com')->first();

        $role = Role::create([
            'name' => 'hr_head',
            'max_active_users' => 1,
        ]);

        $user1 = User::create([
            'name' => 'HR 1',
            'email' => 'hr1@example.com',
            'password' => 'password123',
            'is_active' => true,
        ]);
        $user1->syncRoles(['hr_head']);

        // Capacity reached: attempting to assign another user fails
        $responseFail = $this->actingAs($superAdmin)->post('/users', [
            'name' => 'HR 2',
            'email' => 'hr2@example.com',
            'password' => 'password123',
            'role' => 'hr_head',
        ]);
        $responseFail->assertSessionHasErrors('role');

        // Deactivate User 1 (frees up the active seat)
        $this->actingAs($superAdmin)->patch("/users/{$user1->id}/toggle-status");
        $this->assertFalse($user1->fresh()->is_active);

        // Now assigning User 2 succeeds!
        $responseSuccess = $this->actingAs($superAdmin)->post('/users', [
            'name' => 'HR 2',
            'email' => 'hr2@example.com',
            'password' => 'password123',
            'role' => 'hr_head',
        ]);
        $responseSuccess->assertRedirect('/users');
        $this->assertDatabaseHas('users', ['email' => 'hr2@example.com']);
    }

    public function test_activating_user_prevented_if_role_reached_capacity(): void
    {
        $superAdmin = User::where('email', 'superadmin@example.com')->first();

        $role = Role::create([
            'name' => 'security_officer',
            'max_active_users' => 1,
        ]);

        $activeUser = User::create([
            'name' => 'Active Officer',
            'email' => 'officer1@example.com',
            'password' => 'password123',
            'is_active' => true,
        ]);
        $activeUser->syncRoles(['security_officer']);

        $inactiveUser = User::create([
            'name' => 'Inactive Officer',
            'email' => 'officer2@example.com',
            'password' => 'password123',
            'is_active' => false,
        ]);
        $inactiveUser->syncRoles(['security_officer']);

        // Attempting to activate inactive user should fail because capacity (1) is occupied
        $response = $this->actingAs($superAdmin)->patch("/users/{$inactiveUser->id}/toggle-status");
        $response->assertSessionHas('error');
        $this->assertFalse($inactiveUser->fresh()->is_active);
    }
}
