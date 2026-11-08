<?php

namespace Database\Seeders;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // 1. Create Permissions
        $manageUsers = Permission::firstOrCreate(['name' => 'manage users']);
        $manageAdmins = Permission::firstOrCreate(['name' => 'manage admins']);
        $promoteSuperAdmin = Permission::firstOrCreate(['name' => 'promote super admin']);
        $transferSuperAdmin = Permission::firstOrCreate(['name' => 'transfer super admin']);
        $manageRoles = Permission::firstOrCreate(['name' => 'manage roles']);
        $assignRoles = Permission::firstOrCreate(['name' => 'assign roles']);
        $viewLogs = Permission::firstOrCreate(['name' => 'view logs']);

        // 2. Create Roles and sync permissions
        $superAdminRole = Role::firstOrCreate(['name' => 'super_admin']);
        $superAdminRole->max_active_users = 2;
        $superAdminRole->save();
        $superAdminRole->syncPermissions([
            $manageUsers,
            $manageAdmins,
            $promoteSuperAdmin,
            $transferSuperAdmin,
            $manageRoles,
            $assignRoles,
            $viewLogs,
        ]);

        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $adminRole->syncPermissions([
            $manageUsers,
            $assignRoles,
            $viewLogs,
        ]);

        $userRole = Role::firstOrCreate(['name' => 'user']);
        $userRole->syncPermissions([]);

        // 3. Seed One Initial Super Admin
        $superAdmin = User::firstOrCreate(
            ['email' => 'superadmin@example.com'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        $superAdmin->syncRoles(['super_admin']);

        // 4. Seed an Admin User
        $admin = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        $admin->syncRoles(['admin']);

        // 5. Seed a Basic User
        $basicUser = User::firstOrCreate(
            ['email' => 'user@example.com'],
            [
                'name' => 'Basic User',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        $basicUser->syncRoles(['user']);

        // 6. Seed Initial Activity Logs
        ActivityLog::firstOrCreate(
            [
                'action' => 'system_init',
                'subject_type' => 'System',
            ],
            [
                'actor_id' => $superAdmin->id,
                'actor_name' => $superAdmin->name,
                'subject_name' => 'RBAC System Architecture',
                'metadata' => [
                    'environment' => config('app.env', 'production'),
                    'note' => 'Initial platform bootstrap and role hierarchy configuration completed.',
                ],
                'ip_address' => '127.0.0.1',
            ]
        );

        ActivityLog::firstOrCreate(
            [
                'action' => 'created_user',
                'subject_type' => 'User',
                'subject_id' => $admin->id,
            ],
            [
                'actor_id' => $superAdmin->id,
                'actor_name' => $superAdmin->name,
                'subject_name' => $admin->name,
                'metadata' => [
                    'assigned_role' => 'admin',
                    'email' => $admin->email,
                ],
                'ip_address' => '127.0.0.1',
            ]
        );

        ActivityLog::firstOrCreate(
            [
                'action' => 'created_user',
                'subject_type' => 'User',
                'subject_id' => $basicUser->id,
            ],
            [
                'actor_id' => $admin->id,
                'actor_name' => $admin->name,
                'subject_name' => $basicUser->name,
                'metadata' => [
                    'assigned_role' => 'user',
                    'email' => $basicUser->email,
                ],
                'ip_address' => '127.0.0.1',
            ]
        );
    }
}
