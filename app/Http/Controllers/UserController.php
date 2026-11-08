<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\ActivityLog;
use App\Models\Notification;
use App\Models\Role;
use App\Models\User;
use App\Notifications\AccountInvitation;
use App\Support\SetupLink;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification as NotificationFacade;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', User::class);

        $currentUser = $request->user();
        $search = $request->input('search');
        $roleFilter = $request->input('role');

        $query = User::with('roles')
            ->when($search, function ($q, $search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when($roleFilter, function ($q, $roleFilter) {
                $q->whereHas('roles', fn ($r) => $r->where('name', $roleFilter));
            });

        // If current user cannot manage admins, hide super_admin and admin accounts (except themselves)
        if (! $currentUser->canManageAdmins()) {
            $query->where(function ($q) use ($currentUser) {
                $q->whereDoesntHave('roles', fn ($r) => $r->whereIn('name', ['super_admin', 'admin']))
                    ->orWhere('id', $currentUser->id);
            });
        }

        $users = $query->latest()->paginate(15)->withQueryString();

        // Transform for frontend
        $users->getCollection()->transform(function (User $user) use ($currentUser) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'roles' => $user->roles->pluck('name')->values()->all(),
                'is_active' => (bool) $user->is_active,
                'created_at' => $user->created_at?->format('M d, Y'),
                'can' => [
                    'update' => $currentUser->can('update', $user),
                    'delete' => $currentUser->can('delete', $user),
                    'toggleStatus' => $currentUser->can('toggleStatus', $user),
                    'promoteSuperAdmin' => $currentUser->can('promoteSuperAdmin', $user),
                    'transferSuperAdmin' => $currentUser->can('transferSuperAdmin', $user),
                    'demoteSuperAdmin' => $currentUser->can('demoteSuperAdmin', $user),
                ],
            ];
        });

        $superAdminCount = User::role('super_admin')->count();
        $availableRoles = Role::where('is_active', true)->orderBy('name')->get(['id', 'name']);

        $logSearch = $request->input('log_search');
        $logAction = $request->input('log_action');

        $activityLogs = null;
        if ($currentUser->canManageUsers()) {
            $logsQuery = ActivityLog::where('subject_type', 'User')
                ->when($logSearch, function ($q, $s) {
                    $q->where(function ($sub) use ($s) {
                        $sub->where('actor_name', 'like', "%{$s}%")
                            ->orWhere('subject_name', 'like', "%{$s}%");
                    });
                })
                ->when($logAction, fn ($q, $a) => $q->where('action', 'like', "%{$a}%"))
                ->latest();

            $activityLogs = $logsQuery->paginate(20, ['*'], 'log_page')
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
        }

        return Inertia::render('Users/Index', [
            'users' => $users,
            'filters' => [
                'search' => $search,
                'role' => $roleFilter,
                'log_search' => $logSearch,
                'log_action' => $logAction,
            ],
            'meta' => [
                'superAdminCount' => $superAdminCount,
                'canCreateAdmin' => $currentUser->isSuperAdmin(),
                'canCreateUser' => $currentUser->canManageUsers(),
                'canAssignRoles' => $currentUser->canAssignRoles(),
                'isSuperAdmin' => $currentUser->isSuperAdmin(),
                'currentUserId' => $currentUser->id,
            ],
            'availableRoles' => $availableRoles,
            'activityLogs' => $activityLogs,
        ]);
    }

    /**
     * Display the specified user profile, permissions, and dual audit trail.
     */
    public function show(Request $request, User $user): Response
    {
        $currentUser = $request->user();

        if (! $currentUser->canManageUsers() && $currentUser->id !== $user->id) {
            abort(403, 'Unauthorized access to user profile.');
        }

        $user->load('roles.permissions', 'permissions');

        $bySearch = $request->input('by_search');
        $onSearch = $request->input('on_search');

        // 1. Actions performed BY this user (Actor)
        $logsBy = ActivityLog::where('actor_id', $user->id)
            ->when($bySearch, function ($q, $s) {
                $q->where(function ($sub) use ($s) {
                    $sub->where('action', 'like', "%{$s}%")
                        ->orWhere('subject_name', 'like', "%{$s}%");
                });
            })
            ->latest()
            ->paginate(15, ['*'], 'by_page')
            ->withQueryString()
            ->through(fn ($log) => [
                'id' => $log->id,
                'action' => $log->action,
                'subject_type' => $log->subject_type,
                'subject_id' => $log->subject_id,
                'subject_name' => $log->subject_name,
                'ip_address' => $log->ip_address,
                'metadata' => $log->metadata,
                'created_at_human' => $log->created_at?->diffForHumans(),
                'created_at_date' => $log->created_at?->format('M d, Y g:i A'),
            ]);

        // 2. Actions performed ON this user (Subject)
        $logsOn = ActivityLog::where('subject_type', 'User')
            ->where('subject_id', $user->id)
            ->when($onSearch, function ($q, $s) {
                $q->where(function ($sub) use ($s) {
                    $sub->where('actor_name', 'like', "%{$s}%")
                        ->orWhere('action', 'like', "%{$s}%");
                });
            })
            ->latest()
            ->paginate(15, ['*'], 'on_page')
            ->withQueryString()
            ->through(fn ($log) => [
                'id' => $log->id,
                'actor_id' => $log->actor_id,
                'actor_name' => $log->actor_name,
                'action' => $log->action,
                'ip_address' => $log->ip_address,
                'metadata' => $log->metadata,
                'created_at_human' => $log->created_at?->diffForHumans(),
                'created_at_date' => $log->created_at?->format('M d, Y g:i A'),
            ]);

        // Permissions breakdown
        $rolePermissions = $user->getPermissionsViaRoles()->pluck('name')->unique()->values();
        $directPermissions = $user->getDirectPermissions()->pluck('name')->values();
        $allPermissions = $user->getAllPermissions()->pluck('name')->unique()->values();

        // Metrics for this user
        $userMetrics = [
            'actions_performed' => ActivityLog::where('actor_id', $user->id)->count(),
            'changes_received' => ActivityLog::where('subject_type', 'User')->where('subject_id', $user->id)->count(),
        ];

        $superAdminCount = User::role('super_admin')->count();
        $availableRoles = Role::where('is_active', true)->orderBy('name')->get(['id', 'name']);

        return Inertia::render('Users/Show', [
            'profileUser' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'is_active' => (bool) $user->is_active,
                'email_verified' => ! is_null($user->email_verified_at),
                'email_verified_at' => $user->email_verified_at?->format('M d, Y g:i A'),
                'created_at' => $user->created_at?->format('M d, Y g:i A'),
                'created_at_human' => $user->created_at?->diffForHumans(),
                'roles' => $user->roles->pluck('name'),
                'roles_with_permissions' => $user->roles->map(fn ($r) => [
                    'id' => $r->id,
                    'name' => $r->name,
                    'permissions' => $r->permissions->pluck('name')->values(),
                ]),
                'is_super_admin' => $user->isSuperAdmin(),
                'is_admin' => $user->isAdmin(),
                'is_user' => $user->isUser(),
                'role_permissions' => $rolePermissions,
                'direct_permissions' => $directPermissions,
                'all_permissions' => $allPermissions,
                'can' => [
                    'update' => $currentUser->can('update', $user),
                    'delete' => $currentUser->can('delete', $user),
                    'toggleStatus' => $currentUser->can('toggleStatus', $user),
                    'promoteSuperAdmin' => $currentUser->can('promoteSuperAdmin', $user),
                    'transferSuperAdmin' => $currentUser->can('transferSuperAdmin', $user),
                    'demoteSuperAdmin' => $currentUser->can('demoteSuperAdmin', $user),
                ],
            ],
            'logsBy' => $logsBy,
            'logsOn' => $logsOn,
            'filters' => [
                'by_search' => $bySearch ?? '',
                'on_search' => $onSearch ?? '',
            ],
            'metrics' => $userMetrics,
            'availableRoles' => $availableRoles,
            'meta' => [
                'superAdminCount' => $superAdminCount,
                'canManageUsers' => $currentUser->canManageUsers(),
                'canManageAdmins' => $currentUser->canManageAdmins(),
                'canCreateAdmin' => $currentUser->isSuperAdmin(),
                'canAssignRoles' => $currentUser->canAssignRoles(),
                'canPromoteSuperAdmin' => $currentUser->canPromoteToSuperAdmin(),
                'canTransferSuperAdmin' => $currentUser->canTransferSuperAdmin(),
                'isSuperAdmin' => $currentUser->isSuperAdmin(),
                'currentUserId' => $currentUser->id,
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreUserRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $passwordProvided = filled($validated['password'] ?? null);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            // users.password is NOT NULL: invited accounts get an undisclosed placeholder.
            'password' => $passwordProvided ? $validated['password'] : Str::random(40),
            'must_change_password' => ! $passwordProvided,
        ]);

        $roles = $request->getSelectedRoles();
        $user->syncRoles($roles);

        $roleLabel = implode(', ', array_map(fn ($r) => ucwords(str_replace('_', ' ', $r)), $roles)) ?: 'User';

        $setupLink = $user->must_change_password ? SetupLink::showUrlFor($user) : null;
        $mailSent = $setupLink !== null && $this->sendInvitation($user, $setupLink, $roleLabel);

        Notification::send(
            recipient: $user,
            sender: $request->user(),
            type: 'account.created',
            title: 'Your account has been created',
            options: [
                'body' => "An account was created for you with the role: {$roleLabel}.",
                'action_url' => $setupLink ?? route('dashboard'),
                'action_label' => $setupLink ? 'Set your password' : 'Go to Dashboard',
                'icon' => 'user-plus',
                'severity' => 'success',
            ]
        );

        if ($setupLink === null) {
            return redirect()->route('users.index')
                ->with('success', "Account for '{$user->name}' created successfully.");
        }

        return redirect()->route('users.index')
            ->with('setup_link', $setupLink)
            ->with('setup_link_emailed', $mailSent)
            ->with($mailSent ? 'success' : 'warning', $mailSent
                ? "Account for '{$user->name}' created. A setup link was emailed to {$user->email}."
                : "Account for '{$user->name}' created. Mail is not configured, so copy the setup link below.");
    }

    /**
     * Issue a fresh signed setup link ("forced reset") for an account.
     */
    public function sendSetupLink(Request $request, User $user): RedirectResponse
    {
        Gate::authorize('update', $user);

        // Issuing a setup link invalidates the current password, so it is never
        // self-service: signed-in users change their password from the profile form.
        abort_if($request->user()->is($user), 403);

        $user->forceFill(['must_change_password' => true])->save();

        $setupLink = SetupLink::showUrlFor($user);
        $roleLabel = $user->getRoleNames()
            ->map(fn ($role) => ucwords(str_replace('_', ' ', $role)))
            ->implode(', ') ?: 'User';

        $mailSent = $this->sendInvitation($user, $setupLink, $roleLabel, isReset: true);

        return back()
            ->with('setup_link', $setupLink)
            ->with('setup_link_emailed', $mailSent)
            ->with($mailSent ? 'success' : 'warning', $mailSent
                ? "A setup link was emailed to {$user->email}."
                : 'Mail is not configured. Copy the setup link below and send it manually.');
    }

    /**
     * Send the invitation mail, reporting honestly whether it could be delivered.
     */
    private function sendInvitation(User $user, string $setupLink, string $roleLabel, bool $isReset = false): bool
    {
        if (! SetupLink::mailIsDeliverable()) {
            return false;
        }

        try {
            NotificationFacade::send($user, new AccountInvitation($setupLink, $roleLabel, $isReset));

            return true;
        } catch (Throwable $exception) {
            report($exception);

            return false;
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $validated = $request->validated();

        $user->name = $validated['name'];
        $user->email = $validated['email'];

        if (! empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        $selectedRoles = $request->getSelectedRoles();

        if ($selectedRoles !== null && ($request->user()->canAssignRoles() || $request->user()->canManageAdmins() || $request->user()->isSuperAdmin())) {
            if ($user->isSuperAdmin() && ! in_array('super_admin', $selectedRoles, true)) {
                if (User::role('super_admin')->count() <= 1) {
                    return back()->with('error', 'Cannot remove the last remaining Super Admin role.');
                }
            }
            if (! $request->user()->isSuperAdmin() && (in_array('admin', $selectedRoles, true) || in_array('super_admin', $selectedRoles, true))) {
                return back()->with('error', 'Only Super Admins can assign the Administrator or Super Admin role.');
            }

            $oldRoles = $user->getRoleNames()->sort()->values()->all();
            $user->syncRoles($selectedRoles);
            $newRoles = $user->fresh()->getRoleNames()->sort()->values()->all();

            if ($oldRoles !== $newRoles) {
                $oldLabel = implode(', ', array_map(fn ($r) => ucwords(str_replace('_', ' ', $r)), $oldRoles)) ?: 'None';
                $newLabel = implode(', ', array_map(fn ($r) => ucwords(str_replace('_', ' ', $r)), $newRoles)) ?: 'None';

                Notification::send(
                    recipient: $user,
                    sender: $request->user(),
                    type: 'account.role_changed',
                    title: 'Your account roles have been updated',
                    options: [
                        'body' => "Your roles changed from {$oldLabel} to {$newLabel}.",
                        'action_url' => route('dashboard'),
                        'action_label' => 'Go to Dashboard',
                        'icon' => 'shield',
                        'severity' => 'info',
                        'metadata' => ['old_roles' => $oldLabel, 'new_roles' => $newLabel],
                    ]
                );
            }
        }

        return redirect()->route('users.index')->with('success', "Account '{$user->name}' updated successfully.");
    }

    /**
     * Check if a specific user can be permanently deleted or must be deactivated.
     */
    public function checkDeletion(Request $request, User $user): JsonResponse
    {
        Gate::authorize('delete', $user);

        $hasRelatedData = $user->hasRelatedData();
        $summary = $user->getRelatedDataSummary();

        return response()->json([
            'can_delete' => ! $hasRelatedData,
            'has_related_data' => $hasRelatedData,
            'summary' => $summary,
            'is_active' => (bool) $user->is_active,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, User $user): RedirectResponse
    {
        Gate::authorize('delete', $user);

        if ($user->hasRelatedData()) {
            return back()->with('error', 'Cannot delete this account because it has associated activity logs or records. Please deactivate it instead.');
        }

        $name = $user->name;
        $user->delete();

        Notification::send(
            recipient: null,
            sender: $request->user(),
            type: 'account.deleted',
            title: "Account '{$name}' has been permanently deleted",
            options: [
                'icon' => 'trash-2',
                'severity' => 'warning',
            ]
        );

        return redirect()->route('users.index')->with('success', "Account '{$name}' deleted successfully.");
    }

    /**
     * Promote an admin to super admin.
     */
    public function promoteSuperAdmin(Request $request, User $user): RedirectResponse
    {
        Gate::authorize('promoteSuperAdmin', $user);

        $user->syncRoles(['super_admin']);

        Notification::send(
            recipient: $user,
            sender: $request->user(),
            type: 'account.promoted',
            title: 'You have been promoted to Super Admin',
            options: [
                'body' => 'You now have full system authority.',
                'action_url' => route('dashboard'),
                'action_label' => 'Go to Dashboard',
                'icon' => 'crown',
                'severity' => 'success',
            ]
        );

        return redirect()->route('users.index')->with('success', "{$user->name} has been promoted to Super Admin.");
    }

    /**
     * Transfer super admin privileges to an admin.
     */
    public function transferSuperAdmin(Request $request, User $user): RedirectResponse
    {
        Gate::authorize('transferSuperAdmin', $user);

        $actor = $request->user();

        // Grant super_admin to target
        $user->syncRoles(['super_admin']);

        // Demote actor to admin
        $actor->syncRoles(['admin']);

        Notification::send(
            recipient: $user,
            sender: $actor,
            type: 'account.promoted',
            title: 'Super Admin privileges transferred to you',
            options: [
                'body' => "{$actor->name} has transferred Super Admin to your account.",
                'action_url' => route('dashboard'),
                'action_label' => 'Go to Dashboard',
                'icon' => 'crown',
                'severity' => 'success',
            ]
        );

        Notification::send(
            recipient: $actor,
            sender: null,
            type: 'account.demoted',
            title: 'You transferred your Super Admin role',
            options: [
                'body' => "You are now an Admin. {$user->name} is the new Super Admin.",
                'icon' => 'shield',
                'severity' => 'info',
            ]
        );

        return redirect()->route('users.index')->with('success', "Super Admin privileges transferred to {$user->name}. You are now an Admin.");
    }

    /**
     * Demote a super admin to admin (when 2 super admins exist).
     */
    public function demoteSuperAdmin(Request $request, User $user): RedirectResponse
    {
        Gate::authorize('demoteSuperAdmin', $user);

        $user->syncRoles(['admin']);

        Notification::send(
            recipient: $user,
            sender: $request->user(),
            type: 'account.demoted',
            title: 'Your Super Admin role has been removed',
            options: [
                'body' => 'You have been demoted to Admin.',
                'icon' => 'shield',
                'severity' => 'warning',
            ]
        );

        return redirect()->route('users.index')->with('success', "{$user->name} has been demoted to Admin.");
    }

    /**
     * Toggle the active / inactive status of a user account.
     */
    public function toggleStatus(Request $request, User $user): RedirectResponse
    {
        Gate::authorize('toggleStatus', $user);

        $actor = $request->user();

        // If activating, check if any of user's roles has reached capacity
        if (! $user->is_active) {
            foreach ($user->roles as $role) {
                if ($role->hasReachedCapacity($user)) {
                    return back()->with('error', "Cannot activate user. The role '{$role->name}' has reached its maximum capacity of {$role->max_active_users} active users.");
                }
            }
        }

        $user->is_active = ! $user->is_active;
        $user->save();

        $action = $user->is_active ? 'activated_account' : 'deactivated_account';
        ActivityLog::record($actor, $action, $user, [
            'target_name' => $user->name,
            'target_role' => $user->getRoleNames()->join(', ') ?: 'user',
            'is_active' => $user->is_active,
        ]);

        $status = $user->is_active ? 'activated' : 'deactivated';
        $message = "Account '{$user->name}' has been {$status}.";

        Notification::send(
            recipient: $user,
            sender: $actor,
            type: "account.{$status}",
            title: "Your account has been {$status}",
            options: [
                'icon' => $user->is_active ? 'check-circle' : 'ban',
                'severity' => $user->is_active ? 'success' : 'warning',
            ]
        );

        return redirect()->route('users.index')->with('success', $message);
    }
}
