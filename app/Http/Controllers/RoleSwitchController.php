<?php

namespace App\Http\Controllers;

use App\Models\Role;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class RoleSwitchController extends Controller
{
    /**
     * Switch active role view.
     */
    public function switch(Request $request): RedirectResponse
    {
        $targetRole = $request->input('role');
        $user = $request->user();

        if ($targetRole === null || $targetRole === '' || $targetRole === 'unified') {
            $request->session()->forget(['active_role', 'is_previewing']);

            return back()->with('success', 'Switched to Unified (All Roles) view.');
        }

        // Validate role existence
        $role = Role::where('name', $targetRole)->where('is_active', true)->first();
        if (! $role) {
            return back()->with('error', 'The requested role does not exist or is inactive.');
        }

        // Check authorization:
        // Super Admin can switch to any active role; other users can only switch to their own assigned roles
        $userRoleNames = $user->roles->pluck('name')->all();
        $isOwnRole = in_array($targetRole, $userRoleNames, true);

        if (! $user->isSuperAdmin() && ! $isOwnRole) {
            abort(403, 'You do not possess this role.');
        }

        $request->session()->put('active_role', $targetRole);
        $request->session()->put('is_previewing', $user->isSuperAdmin() && ! $isOwnRole);

        $roleLabel = str_replace('_', ' ', ucwords($targetRole, '_'));
        $previewNotice = ($user->isSuperAdmin() && ! $isOwnRole) ? ' (Preview Mode)' : '';

        return back()->with('success', "Active view switched to {$roleLabel}{$previewNotice}.");
    }

    /**
     * Exit role preview / reset to unified view.
     */
    public function exit(Request $request): RedirectResponse
    {
        $request->session()->forget(['active_role', 'is_previewing']);

        return back()->with('success', 'Exited preview mode.');
    }
}
