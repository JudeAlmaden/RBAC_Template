<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\Response;

class UserPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $actor): bool
    {
        return $actor->canManageUsers();
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $actor, User $target): bool
    {
        if ($actor->id === $target->id) {
            return true;
        }

        if ($actor->canManageAdmins()) {
            return true;
        }

        if ($actor->canManageUsers()) {
            return ! $target->isAdmin() && ! $target->isSuperAdmin();
        }

        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $actor): bool
    {
        return $actor->canManageUsers();
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $actor, User $target): bool
    {
        // Super Admin accounts cannot be edited via the standard edit form.
        // Use the dedicated promote / transfer / demote actions instead.
        if ($target->isSuperAdmin()) {
            return false;
        }

        if ($actor->canManageAdmins()) {
            return true;
        }

        if ($actor->canManageUsers()) {
            // Can update non-admin, non-super-admin users
            return ! $target->isAdmin() && ! $target->isSuperAdmin();
        }

        return $actor->id === $target->id;
    }

    /**
     * Determine whether the actor can toggle the active status of target.
     */
    public function toggleStatus(User $actor, User $target): Response
    {
        if ($actor->id === $target->id) {
            return Response::deny('You cannot deactivate your own account.');
        }

        if ($target->isSuperAdmin()) {
            if (! $actor->isSuperAdmin()) {
                return Response::deny('Only a Super Admin can change the status of a Super Admin.');
            }
            if ($target->is_active) {
                $activeSuperAdmins = User::role('super_admin')->where('is_active', true)->count();
                if ($activeSuperAdmins <= 1) {
                    return Response::deny('Cannot deactivate the last remaining active Super Admin.');
                }
            }
        }

        if (! $this->update($actor, $target)) {
            return Response::deny('You do not have permission to change this user\'s status.');
        }

        return Response::allow();
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $actor, User $target): Response
    {
        if ($actor->id === $target->id) {
            return Response::deny('You cannot delete your own account.');
        }

        if ($actor->canManageAdmins()) {
            if ($target->isSuperAdmin()) {
                if (! $actor->isSuperAdmin()) {
                    return Response::deny('Only a Super Admin can delete a Super Admin account.');
                }
                $superAdminCount = User::role('super_admin')->count();
                if ($superAdminCount <= 1) {
                    return Response::deny('Cannot delete the last remaining Super Admin.');
                }
            }

            return Response::allow();
        }

        if ($actor->canManageUsers()) {
            if ($target->isAdmin() || $target->isSuperAdmin()) {
                return Response::deny('Admins can only delete regular user and custom role accounts.');
            }

            return Response::allow();
        }

        return Response::deny('Unauthorized action.');
    }

    /**
     * Determine whether the actor can promote a target to super_admin.
     */
    public function promoteSuperAdmin(User $actor, User $target): Response
    {
        if (! $actor->can('promote super admin')) {
            return Response::deny('Only a Super Admin can promote another account.');
        }

        if ($target->isSuperAdmin()) {
            return Response::deny('Target account is already a Super Admin.');
        }

        $superAdminCount = User::role('super_admin')->count();
        if ($superAdminCount >= 2) {
            return Response::deny('There can be at most two (2) Super Admins in the system.');
        }

        return Response::allow();
    }

    /**
     * Determine whether the actor can transfer super_admin privileges to target.
     */
    public function transferSuperAdmin(User $actor, User $target): Response
    {
        if (! $actor->can('transfer super admin')) {
            return Response::deny('Only a Super Admin can transfer privileges.');
        }

        if ($actor->id === $target->id) {
            return Response::deny('You already possess Super Admin privileges.');
        }

        if ($target->isSuperAdmin()) {
            return Response::deny('Target account is already a Super Admin.');
        }

        return Response::allow();
    }

    /**
     * Determine whether the actor can demote a super_admin to admin.
     */
    public function demoteSuperAdmin(User $actor, User $target): Response
    {
        if (! $actor->isSuperAdmin()) {
            return Response::deny('Only a Super Admin can demote another Super Admin.');
        }

        if (! $target->isSuperAdmin()) {
            return Response::deny('Target account is not a Super Admin.');
        }

        $superAdminCount = User::role('super_admin')->count();
        if ($superAdminCount <= 1) {
            return Response::deny('Cannot demote the only remaining Super Admin.');
        }

        return Response::allow();
    }
}
