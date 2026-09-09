<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoleSwitchTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_super_admin_can_switch_to_any_role(): void
    {
        $superAdmin = User::where('email', 'superadmin@example.com')->first();

        $response = $this->actingAs($superAdmin)->post('/switch-role', [
            'role' => 'user',
        ]);

        $response->assertSessionHas('active_role', 'user');
        $response->assertSessionHas('is_previewing', true);
    }

    public function test_super_admin_can_exit_preview(): void
    {
        $superAdmin = User::where('email', 'superadmin@example.com')->first();

        $this->actingAs($superAdmin)->post('/switch-role', [
            'role' => 'user',
        ]);

        $response = $this->actingAs($superAdmin)->post('/switch-role/exit');

        $response->assertSessionMissing('active_role');
        $response->assertSessionMissing('is_previewing');
    }

    public function test_multi_role_user_can_switch_to_their_own_role(): void
    {
        $user = User::where('email', 'user@example.com')->first();
        $customRole = Role::create(['name' => 'hr_manager']);
        $user->syncRoles(['user', 'hr_manager']);

        $response = $this->actingAs($user)->post('/switch-role', [
            'role' => 'hr_manager',
        ]);

        $response->assertSessionHas('active_role', 'hr_manager');
        $response->assertSessionHas('is_previewing', false);
    }

    public function test_user_cannot_switch_to_a_role_they_do_not_have(): void
    {
        $user = User::where('email', 'user@example.com')->first();

        $response = $this->actingAs($user)->post('/switch-role', [
            'role' => 'admin',
        ]);

        $response->assertForbidden();
    }
}
