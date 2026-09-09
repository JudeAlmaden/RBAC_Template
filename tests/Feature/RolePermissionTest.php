<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RolePermissionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_super_admin_can_view_roles_index(): void
    {
        $superAdmin = User::where('email', 'superadmin@example.com')->first();

        $response = $this->actingAs($superAdmin)->get('/roles');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Roles/Index')
            ->has('roles')
            ->has('categorizedPermissions')
        );
    }

    public function test_admin_without_manage_roles_cannot_access_roles_index(): void
    {
        $admin = User::where('email', 'admin@example.com')->first();

        $response = $this->actingAs($admin)->get('/roles');

        $response->assertForbidden();
    }

    public function test_basic_user_cannot_access_roles_index(): void
    {
        $user = User::where('email', 'user@example.com')->first();

        $response = $this->actingAs($user)->get('/roles');

        $response->assertForbidden();
    }

    public function test_super_admin_can_create_custom_role_with_permissions(): void
    {
        $superAdmin = User::where('email', 'superadmin@example.com')->first();

        $response = $this->actingAs($superAdmin)->post('/roles', [
            'name' => 'HR Specialist',
            'permissions' => ['manage users'],
        ]);

        $response->assertRedirect('/roles');
        $this->assertDatabaseHas('roles', ['name' => 'hr_specialist']);

        $role = Role::findByName('hr_specialist');
        $this->assertTrue($role->hasPermissionTo('manage users'));
        $this->assertFalse($role->hasPermissionTo('manage admins'));

        // Check activity log recorded
        $this->assertDatabaseHas('activity_logs', [
            'actor_id' => $superAdmin->id,
            'action' => 'created_role',
            'subject_type' => 'Role',
            'subject_name' => 'hr_specialist',
        ]);
    }

    public function test_super_admin_can_update_custom_role_permissions(): void
    {
        $superAdmin = User::where('email', 'superadmin@example.com')->first();
        $role = Role::create(['name' => 'editor']);
        $role->syncPermissions(['manage users']);

        $response = $this->actingAs($superAdmin)->put("/roles/{$role->id}", [
            'name' => 'Lead Editor',
            'permissions' => ['manage users', 'manage admins'],
        ]);

        $response->assertRedirect('/roles');
        $role = $role->fresh();
        $this->assertEquals('lead_editor', $role->name);
        $this->assertTrue($role->hasPermissionTo('manage admins'));

        // Check activity log recorded
        $this->assertDatabaseHas('activity_logs', [
            'actor_id' => $superAdmin->id,
            'action' => 'updated_role',
            'subject_type' => 'Role',
        ]);
    }

    public function test_protected_system_roles_cannot_be_deleted(): void
    {
        $superAdmin = User::where('email', 'superadmin@example.com')->first();
        $adminRole = Role::findByName('admin');

        $response = $this->actingAs($superAdmin)->delete("/roles/{$adminRole->id}");

        $response->assertSessionHas('error');
        $this->assertDatabaseHas('roles', ['name' => 'admin']);
    }

    public function test_custom_role_with_assigned_users_cannot_be_deleted(): void
    {
        $superAdmin = User::where('email', 'superadmin@example.com')->first();
        $customRole = Role::create(['name' => 'support']);

        $user = User::create([
            'name' => 'Support User',
            'email' => 'support@example.com',
            'password' => 'password',
        ]);
        $user->syncRoles(['support']);

        $response = $this->actingAs($superAdmin)->delete("/roles/{$customRole->id}");

        $response->assertSessionHas('error');
        $this->assertDatabaseHas('roles', ['name' => 'support']);
    }

    public function test_super_admin_can_delete_unused_custom_role(): void
    {
        $superAdmin = User::where('email', 'superadmin@example.com')->first();
        $customRole = Role::create(['name' => 'temporary']);

        $response = $this->actingAs($superAdmin)->delete("/roles/{$customRole->id}");

        $response->assertRedirect('/roles');
        $this->assertDatabaseMissing('roles', ['name' => 'temporary']);

        // Check activity log recorded
        $this->assertDatabaseHas('activity_logs', [
            'actor_id' => $superAdmin->id,
            'action' => 'deleted_role',
            'subject_type' => 'Role',
        ]);
    }

    public function test_super_admin_can_assign_custom_role_to_new_user(): void
    {
        $superAdmin = User::where('email', 'superadmin@example.com')->first();
        Role::create(['name' => 'auditor']);

        $response = $this->actingAs($superAdmin)->post('/users', [
            'name' => 'Auditor User',
            'email' => 'auditor@example.com',
            'password' => 'password123',
            'role' => 'auditor',
        ]);

        $response->assertRedirect('/users');
        $this->assertDatabaseHas('users', ['email' => 'auditor@example.com']);
        $user = User::where('email', 'auditor@example.com')->first();
        $this->assertTrue($user->hasRole('auditor'));
    }

    public function test_admin_with_assign_roles_can_assign_custom_role(): void
    {
        $admin = User::where('email', 'admin@example.com')->first();
        Role::create(['name' => 'hr_manager']);

        $response = $this->actingAs($admin)->post('/users', [
            'name' => 'HR Specialist',
            'email' => 'hr@example.com',
            'password' => 'password123',
            'role' => 'hr_manager',
        ]);

        $response->assertRedirect('/users');
        $this->assertDatabaseHas('users', ['email' => 'hr@example.com']);
        $user = User::where('email', 'hr@example.com')->first();
        $this->assertTrue($user->hasRole('hr_manager'));
    }

    public function test_admin_cannot_assign_admin_role_without_manage_admins(): void
    {
        $admin = User::where('email', 'admin@example.com')->first();

        $response = $this->actingAs($admin)->post('/users', [
            'name' => 'Another Admin',
            'email' => 'anotheradmin@example.com',
            'password' => 'password123',
            'role' => 'admin',
        ]);

        $response->assertSessionHasErrors(['role']);
    }

    public function test_super_admin_can_toggle_custom_role_status_and_activity_is_logged(): void
    {
        $superAdmin = User::where('email', 'superadmin@example.com')->first();
        $customRole = Role::create(['name' => 'compliance_officer', 'is_active' => true]);

        // Deactivate role
        $response = $this->actingAs($superAdmin)->patch("/roles/{$customRole->id}/toggle-status");
        $response->assertRedirect('/roles');
        $this->assertFalse($customRole->fresh()->is_active);

        $this->assertDatabaseHas('activity_logs', [
            'actor_id' => $superAdmin->id,
            'action' => 'deactivated_role',
            'subject_type' => 'Role',
        ]);

        // Reactivate role
        $response2 = $this->actingAs($superAdmin)->patch("/roles/{$customRole->id}/toggle-status");
        $response2->assertRedirect('/roles');
        $this->assertTrue($customRole->fresh()->is_active);

        $this->assertDatabaseHas('activity_logs', [
            'actor_id' => $superAdmin->id,
            'action' => 'activated_role',
            'subject_type' => 'Role',
        ]);
    }

    public function test_protected_roles_cannot_be_deactivated(): void
    {
        $superAdmin = User::where('email', 'superadmin@example.com')->first();
        $adminRole = Role::findByName('admin');

        $response = $this->actingAs($superAdmin)->patch("/roles/{$adminRole->id}/toggle-status");
        $response->assertSessionHas('error');
        $this->assertTrue($adminRole->fresh()->is_active);
    }

    public function test_inactive_role_excluded_from_available_roles_in_users_index(): void
    {
        $superAdmin = User::where('email', 'superadmin@example.com')->first();
        Role::create(['name' => 'active_role', 'is_active' => true]);
        Role::create(['name' => 'inactive_role', 'is_active' => false]);

        $response = $this->actingAs($superAdmin)->get('/users');
        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Users/Index')
            ->where('availableRoles', function ($roles) {
                $names = collect($roles)->pluck('name');

                return $names->contains('active_role') && ! $names->contains('inactive_role');
            })
        );
    }

    public function test_cannot_delete_role_with_assigned_users(): void
    {
        $superAdmin = User::where('email', 'superadmin@example.com')->first();
        $role = Role::create(['name' => 'department_lead']);

        $user = User::create([
            'name' => 'Lead User',
            'email' => 'lead@example.com',
            'password' => 'password123',
        ]);
        $user->syncRoles(['department_lead']);

        $response = $this->actingAs($superAdmin)->delete("/roles/{$role->id}");
        $response->assertSessionHas('error');
        $this->assertDatabaseHas('roles', ['name' => 'department_lead']);
    }
}
