<?php

namespace App\Http\Middleware;

use App\Models\Notification;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        $superAdminCount = 0;
        try {
            $superAdminCount = User::role('super_admin')->count();
        } catch (\Throwable) {
            // Ignore if role table empty in tests
        }

        // Unread notification count — lazy so it only runs when user is logged in
        $unreadNotifications = 0;
        if ($user) {
            try {
                $unreadNotifications = Notification::forUser($user->id)->visible()->unread()->count();
            } catch (\Throwable) {
                // Graceful during migrations
            }
        }

        $activeRole = $request->session()->get('active_role');
        $isPreviewing = (bool) $request->session()->get('is_previewing');

        $switchableRoles = [];
        if ($user) {
            if ($user->isSuperAdmin()) {
                try {
                    $switchableRoles = Role::where('is_active', true)
                        ->orderBy('name')
                        ->pluck('name')
                        ->all();
                } catch (\Throwable) {
                    $switchableRoles = $user->roles->pluck('name')->all();
                }
            } elseif ($user->roles->count() > 1) {
                $switchableRoles = $user->roles->pluck('name')->all();
            }
        }

        $effectivePermissions = $user ? $user->getAllPermissions()->pluck('name') : collect();
        $simulatedCan = null;

        if ($user) {
            if ($activeRole) {
                $roleModel = Role::where('name', $activeRole)->first();
                $rolePerms = $roleModel ? $roleModel->permissions->pluck('name') : collect();
                $effectivePermissions = $rolePerms;

                $simulatedCan = [
                    'manageUsers' => $rolePerms->contains('manage users'),
                    'manageAdmins' => $rolePerms->contains('manage admins'),
                    'manageRoles' => $rolePerms->contains('manage roles'),
                    'viewLogs' => $rolePerms->contains('view logs') || $rolePerms->contains('manage users') || $rolePerms->contains('manage roles'),
                    'isSuperAdmin' => $activeRole === 'super_admin',
                    'canPromoteSuperAdmin' => $rolePerms->contains('promote super admin'),
                    'superAdminCount' => $superAdminCount,
                ];
            } else {
                $simulatedCan = [
                    'manageUsers' => $user->canManageUsers(),
                    'manageAdmins' => $user->canManageAdmins(),
                    'manageRoles' => $user->canManageRoles(),
                    'viewLogs' => $user->canViewLogs(),
                    'isSuperAdmin' => $user->isSuperAdmin(),
                    'canPromoteSuperAdmin' => $user->canPromoteToSuperAdmin(),
                    'superAdminCount' => $superAdminCount,
                ];
            }
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $activeRole ?: $user->role,
                    'roles' => $user->roles->pluck('name'),
                    'permissions' => $effectivePermissions,
                    'must_change_password' => $user->must_change_password,
                ] : null,
                'can' => $simulatedCan,
            ],
            'roleContext' => [
                'activeRole' => $activeRole,
                'switchableRoles' => $switchableRoles,
                'isPreviewing' => $isPreviewing,
            ],
            'notifications' => [
                'unread_count' => $unreadNotifications,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'warning' => fn () => $request->session()->get('warning'),
            ],
            'ziggy' => fn () => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
        ];
    }
}
