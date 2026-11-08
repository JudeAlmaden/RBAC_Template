<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RbacPbacTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_super_admin_can_view_accounts_list(): void
    {
        $superAdmin = User::where('email', 'superadmin@example.com')->first();

        $response = $this->actingAs($superAdmin)->get('/users');

        $response->assertOk();
    }

    public function test_basic_user_cannot_view_accounts_list(): void
    {
        $user = User::where('email', 'user@example.com')->first();

        $response = $this->actingAs($user)->get('/users');

        $response->assertForbidden();
    }

    public function test_admin_can_create_basic_user(): void
    {
        $admin = User::where('email', 'admin@example.com')->first();

        $response = $this->actingAs($admin)->post('/users', [
            'name' => 'New User by Admin',
            'email' => 'newuser@example.com',
            'password' => 'password123',
            'role' => 'user',
        ]);

        $response->assertRedirect('/users');
        $this->assertDatabaseHas('users', ['email' => 'newuser@example.com']);
    }

    public function test_admin_cannot_create_admin(): void
    {
        $admin = User::where('email', 'admin@example.com')->first();

        $response = $this->actingAs($admin)->post('/users', [
            'name' => 'Attempt Admin',
            'email' => 'attemptadmin@example.com',
            'password' => 'password123',
            'role' => 'admin',
        ]);

        $response->assertSessionHasErrors('role');
    }

    public function test_super_admin_can_create_admin(): void
    {
        $superAdmin = User::where('email', 'superadmin@example.com')->first();

        $response = $this->actingAs($superAdmin)->post('/users', [
            'name' => 'Second Admin',
            'email' => 'secondadmin@example.com',
            'password' => 'password123',
            'role' => 'admin',
        ]);

        $response->assertRedirect('/users');
        $this->assertDatabaseHas('users', ['email' => 'secondadmin@example.com']);
        $newAdmin = User::where('email', 'secondadmin@example.com')->first();
        $this->assertTrue($newAdmin->isAdmin());
    }

    public function test_super_admin_can_promote_admin_to_super_admin_up_to_two(): void
    {
        $superAdmin = User::where('email', 'superadmin@example.com')->first();
        $admin = User::where('email', 'admin@example.com')->first();

        // 1st promotion: from 1 to 2 super admins
        $response = $this->actingAs($superAdmin)->post("/users/{$admin->id}/promote-super-admin");
        $response->assertRedirect('/users');
        $this->assertTrue($admin->fresh()->isSuperAdmin());

        // Create a 3rd admin
        $thirdUser = User::create([
            'name' => 'Third User',
            'email' => 'third@example.com',
            'password' => 'password',
        ]);
        $thirdUser->syncRoles(['admin']);

        // Attempting to promote 3rd admin should be forbidden (Max 2 super admins)
        $response2 = $this->actingAs($superAdmin)->post("/users/{$thirdUser->id}/promote-super-admin");
        $response2->assertForbidden();
    }

    public function test_super_admin_privileges_are_transferrable_to_admin(): void
    {
        $superAdmin = User::where('email', 'superadmin@example.com')->first();
        $admin = User::where('email', 'admin@example.com')->first();

        $response = $this->actingAs($superAdmin)->post("/users/{$admin->id}/transfer-super-admin");

        $response->assertRedirect('/users');
        // Admin becomes super admin
        $this->assertTrue($admin->fresh()->isSuperAdmin());
        // Original super admin becomes admin
        $this->assertTrue($superAdmin->fresh()->isAdmin());
    }

    public function test_super_admin_can_promote_basic_user_directly_to_super_admin(): void
    {
        $superAdmin = User::where('email', 'superadmin@example.com')->first();
        $basicUser = User::where('email', 'user@example.com')->first();

        $response = $this->actingAs($superAdmin)->post("/users/{$basicUser->id}/promote-super-admin");
        $response->assertRedirect('/users');
        $this->assertTrue($basicUser->fresh()->isSuperAdmin());
    }

    public function test_super_admin_can_transfer_privileges_to_basic_user(): void
    {
        $superAdmin = User::where('email', 'superadmin@example.com')->first();
        $basicUser = User::where('email', 'user@example.com')->first();

        $response = $this->actingAs($superAdmin)->post("/users/{$basicUser->id}/transfer-super-admin");
        $response->assertRedirect('/users');
        $this->assertTrue($basicUser->fresh()->isSuperAdmin());
        $this->assertTrue($superAdmin->fresh()->isAdmin());
    }

    public function test_public_registration_endpoint_is_removed(): void
    {
        $response = $this->get('/register');
        $response->assertNotFound();
    }

    public function test_super_admin_can_create_user_with_multiple_roles(): void
    {
        $superAdmin = User::where('email', 'superadmin@example.com')->first();
        Role::create(['name' => 'manager']);

        $response = $this->actingAs($superAdmin)->post('/users', [
            'name' => 'Multi Role User',
            'email' => 'multirole@example.com',
            'password' => 'password123',
            'roles' => ['user', 'manager'],
        ]);

        $response->assertRedirect('/users');
        $user = User::where('email', 'multirole@example.com')->first();
        $this->assertNotNull($user);
        $this->assertTrue($user->hasRole('user'));
        $this->assertTrue($user->hasRole('manager'));
        $this->assertCount(2, $user->roles);
    }

    public function test_super_admin_can_update_user_with_multiple_roles(): void
    {
        $superAdmin = User::where('email', 'superadmin@example.com')->first();
        $user = User::where('email', 'user@example.com')->first();
        Role::create(['name' => 'support']);

        $response = $this->actingAs($superAdmin)->put("/users/{$user->id}", [
            'name' => 'Updated User',
            'email' => 'user@example.com',
            'roles' => ['user', 'admin', 'support'],
        ]);

        $response->assertRedirect('/users');
        $user = $user->fresh();
        $this->assertTrue($user->hasRole('user'));
        $this->assertTrue($user->hasRole('admin'));
        $this->assertTrue($user->hasRole('support'));
        $this->assertCount(3, $user->roles);
    }
}
