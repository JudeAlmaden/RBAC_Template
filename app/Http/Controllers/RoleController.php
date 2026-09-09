<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Role;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;

class RoleController extends Controller
{
    /**
     * Map permissions to logical module categories.
     */
    protected function categorizePermissions(): array
    {
        $allPermissions = Permission::orderBy('name')->get();

        $categoryDefinitions = [
            'User Management' => [
                'manage users' => 'View, create, edit, and manage standard user accounts',
                'manage admins' => 'Create, edit, and manage Administrator accounts',
            ],
            'Super Admin & Ownership' => [
                'promote super admin' => 'Promote administrators to Super Admin (up to system limit)',
                'transfer super admin' => 'Transfer primary Super Admin privileges to another administrator',
            ],
            'Roles & Permissions' => [
                'manage roles' => 'Access roles & permissions management, create custom roles, and assign permissions',
            ],
        ];

        $grouped = [];
        $categorizedNames = [];

        foreach ($categoryDefinitions as $category => $permMap) {
            $items = [];
            foreach ($permMap as $name => $description) {
                $permission = $allPermissions->firstWhere('name', $name);
                if ($permission) {
                    $items[] = [
                        'id' => $permission->id,
                        'name' => $permission->name,
                        'description' => $description,
                    ];
                    $categorizedNames[] = $name;
                }
            }
            if (! empty($items)) {
                $grouped[] = [
                    'category' => $category,
                    'permissions' => $items,
                ];
            }
        }

        // Dynamically append any other newly seeded module permissions (e.g. HR, Payroll)
        $otherPermissions = $allPermissions->filter(fn ($p) => ! in_array($p->name, $categorizedNames, true));
        if ($otherPermissions->isNotEmpty()) {
            $grouped[] = [
                'category' => 'Other Modules',
                'permissions' => $otherPermissions->map(fn ($p) => [
                    'id' => $p->id,
                    'name' => $p->name,
                    'description' => 'Module permission for '.Str::headline($p->name),
                ])->values()->all(),
            ];
        }

        return $grouped;
    }

    /**
     * Display a listing of all roles and permissions.
     */
    public function index(Request $request): Response
    {
        if (! $request->user()->canManageRoles()) {
            abort(403, 'Unauthorized. You do not have permission to manage roles.');
        }

        $roles = Role::with('permissions')
            ->withCount([
                'users as total_users_count',
                'users as active_users_count' => fn ($q) => $q->where('is_active', true),
            ])
            ->get()
            ->map(function (Role $role) {
                return [
                    'id' => $role->id,
                    'name' => $role->name,
                    'isProtected' => $role->isProtected(),
                    'usersCount' => $role->total_users_count,
                    'activeUsersCount' => $role->active_users_count,
                    'maxActiveUsers' => $role->max_active_users,
                    'is_active' => (bool) $role->is_active,
                    'permissions' => $role->permissions->pluck('name')->values()->all(),
                ];
            });

        $logSearch = $request->input('log_search');
        $logAction = $request->input('log_action');

        $activityLogs = ActivityLog::where('subject_type', 'Role')
            ->when($logSearch, function ($q, $s) {
                $q->where(function ($sub) use ($s) {
                    $sub->where('actor_name', 'like', "%{$s}%")
                        ->orWhere('subject_name', 'like', "%{$s}%");
                });
            })
            ->when($logAction, fn ($q, $a) => $q->where('action', 'like', "%{$a}%"))
            ->latest()
            ->paginate(20, ['*'], 'log_page')
            ->withQueryString()
            ->through(fn ($log) => [
                'id' => $log->id,
                'actor_name' => $log->actor_name,
                'action' => $log->action,
                'subject_type' => $log->subject_type,
                'subject_name' => $log->subject_name,
                'metadata' => $log->metadata,
                'created_at_human' => $log->created_at->diffForHumans(),
                'created_at_date' => $log->created_at->format('M d, Y g:i A'),
            ]);

        return Inertia::render('Roles/Index', [
            'roles' => $roles,
            'categorizedPermissions' => $this->categorizePermissions(),
            'activityLogs' => $activityLogs,
            'logFilters' => [
                'log_search' => $logSearch,
                'log_action' => $logAction,
            ],
        ]);
    }

    /**
     * Store a newly created custom role in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $actor = $request->user();
        if (! $actor->canManageRoles()) {
            abort(403, 'Unauthorized.');
        }

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'min:2',
                'max:50',
                'regex:/^[a-zA-Z0-9_\-\s]+$/',
                Rule::unique('roles', 'name'),
            ],
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['string', Rule::exists('permissions', 'name')],
            'max_active_users' => ['nullable', 'integer', 'min:1'],
        ]);

        // Standardize name: lowercase and underscore if spaces used
        $roleName = Str::slug($validated['name'], '_');

        if (Role::where('name', $roleName)->exists()) {
            return back()->withErrors(['name' => "A role with identifier '{$roleName}' already exists."]);
        }

        $role = Role::create([
            'name' => $roleName,
            'guard_name' => 'web',
            'max_active_users' => $validated['max_active_users'] ?? null,
        ]);

        $perms = $validated['permissions'] ?? [];
        $role->syncPermissions($perms);

        ActivityLog::record($actor, 'created_role', $role, [
            'permissions' => $perms,
            'max_active_users' => $role->max_active_users,
        ]);

        return redirect()->route('roles.index')
            ->with('success', "Role '{$role->name}' created successfully.");
    }

    /**
     * Update the specified role in storage.
     */
    public function update(Request $request, Role $role): RedirectResponse
    {
        $actor = $request->user();
        if (! $actor->canManageRoles()) {
            abort(403, 'Unauthorized.');
        }

        $rules = [
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['string', Rule::exists('permissions', 'name')],
            'max_active_users' => ['nullable', 'integer', 'min:1'],
        ];

        // Only allow renaming if role is not a protected system role
        if (! $role->isProtected()) {
            $rules['name'] = [
                'required',
                'string',
                'min:2',
                'max:50',
                'regex:/^[a-zA-Z0-9_\-\s]+$/',
                Rule::unique('roles', 'name')->ignore($role->id),
            ];
        }

        $validated = $request->validate($rules);

        if (! $role->isProtected() && isset($validated['name'])) {
            $newName = Str::slug($validated['name'], '_');
            if ($newName !== $role->name && Role::where('name', $newName)->where('id', '!=', $role->id)->exists()) {
                return back()->withErrors(['name' => "A role with identifier '{$newName}' already exists."]);
            }
            $role->name = $newName;
        }

        if (array_key_exists('max_active_users', $validated)) {
            $role->max_active_users = $validated['max_active_users'];
        }

        $role->save();

        $newPermissions = $validated['permissions'] ?? [];

        // Safeguard super_admin: cannot remove core super admin permissions
        if ($role->name === 'super_admin') {
            $essential = ['manage users', 'manage admins', 'promote super admin', 'transfer super admin', 'manage roles'];
            $newPermissions = array_unique(array_merge($newPermissions, $essential));
        }

        $oldPermissions = $role->permissions->pluck('name')->values()->all();
        $role->syncPermissions($newPermissions);

        $added = array_values(array_diff($newPermissions, $oldPermissions));
        $removed = array_values(array_diff($oldPermissions, $newPermissions));

        ActivityLog::record($actor, 'updated_role', $role, [
            'added' => $added,
            'removed' => $removed,
            'max_active_users' => $role->max_active_users,
        ]);

        return redirect()->route('roles.index')
            ->with('success', "Role '{$role->name}' updated successfully.");
    }

    /**
     * Toggle the active status of a custom role.
     */
    public function toggleStatus(Request $request, Role $role): RedirectResponse
    {
        $actor = $request->user();
        if (! $actor->canManageRoles()) {
            abort(403, 'Unauthorized.');
        }

        if ($role->isProtected()) {
            return back()->with('error', "System role '{$role->name}' is protected and cannot be deactivated.");
        }

        $role->is_active = ! $role->is_active;
        $role->save();

        ActivityLog::record($actor, $role->is_active ? 'activated_role' : 'deactivated_role', $role, [
            'role_name' => $role->name,
            'is_active' => $role->is_active,
        ]);

        $statusText = $role->is_active ? 'activated' : 'deactivated';

        return redirect()->route('roles.index')
            ->with('success', "Role '{$role->name}' successfully {$statusText}.");
    }

    /**
     * Remove the specified role from storage.
     */
    public function destroy(Request $request, Role $role): RedirectResponse
    {
        $actor = $request->user();
        if (! $actor->canManageRoles()) {
            abort(403, 'Unauthorized.');
        }

        if ($role->isProtected()) {
            return back()->with('error', "System role '{$role->name}' is protected and cannot be deleted.");
        }

        if ($role->users()->count() > 0) {
            return back()->with('error', "Cannot delete role '{$role->name}' because {$role->users()->count()} user(s) are assigned to it. Please deactivate this role instead.");
        }

        $roleName = $role->name;
        $role->delete();

        ActivityLog::record($actor, 'deleted_role', $role, [
            'role_name' => $roleName,
        ]);

        return redirect()->route('roles.index')
            ->with('success', "Role '{$roleName}' deleted successfully.");
    }
}
