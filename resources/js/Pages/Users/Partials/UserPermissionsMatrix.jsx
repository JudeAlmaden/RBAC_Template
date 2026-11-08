import React from 'react';
import {
    Shield,
    ShieldCheck,
    Crown,
    User,
    Sparkles,
} from 'lucide-react';

function getRoleIcon(roleName) {
    switch (roleName) {
        case 'super_admin':
            return <Crown className="w-3.5 h-3.5 text-brand" />;
        case 'admin':
            return <Shield className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />;
        case 'user':
            return <User className="w-3.5 h-3.5 text-body-subtle" />;
        default:
            return <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
    }
}

export default function UserPermissionsMatrix({ profileUser, formatRoleText }) {
    return (
        <div className="p-6 rounded-xl bg-canvas-card border border-line shadow-sm space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-brand" />
                    <h3 className="text-sm font-bold text-body-main">Effective Permissions Matrix</h3>
                </div>
                <span className="text-xs text-body-subtle font-medium">
                    {profileUser.all_permissions?.length ?? 0} total active permissions
                </span>
            </div>

            <p className="text-xs text-body-muted">
                Permissions are dynamically inherited from assigned roles (RBAC) and combined with any direct user policy grants (PBAC).
            </p>

            {/* Grouped Roles Section */}
            <div className="space-y-3 pt-1">
                {(profileUser.roles_with_permissions ?? []).length === 0 ? (
                    <div className="p-4 rounded-xl bg-canvas-surface border border-line text-xs text-body-subtle italic">
                        No roles assigned to this account.
                    </div>
                ) : (
                    (profileUser.roles_with_permissions ?? []).map((role) => (
                        <div
                            key={role.id || role.name}
                            className="p-4 rounded-xl bg-canvas-surface border border-line space-y-3"
                        >
                            <div className="flex items-center justify-between flex-wrap gap-2">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 rounded-lg bg-canvas-card border border-line flex items-center justify-center shrink-0 shadow-sm">
                                        {getRoleIcon(role.name)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-xs font-bold text-body-main">
                                                {formatRoleText ? formatRoleText(role.name) : role.name} Role
                                            </h4>
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-canvas-muted text-body-muted">
                                                {role.name === 'super_admin'
                                                    ? 'All System Permissions'
                                                    : `${role.permissions?.length ?? 0} permission${role.permissions?.length === 1 ? '' : 's'}`}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <span className="text-[10px] font-semibold tracking-wider uppercase text-body-subtle">
                                    Inherited via RBAC
                                </span>
                            </div>

                            {role.name === 'super_admin' ? (
                                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-brand/10 text-brand border border-brand/20 text-xs font-semibold">
                                    <ShieldCheck className="w-4 h-4 shrink-0" />
                                    Full System Authority (Wildcard Access to All Actions)
                                </div>
                            ) : (role.permissions?.length ?? 0) === 0 ? (
                                <p className="text-xs text-body-subtle italic py-1">
                                    No elevated permissions attached to this role.
                                </p>
                            ) : (
                                <div className="flex flex-wrap gap-1.5 pt-0.5">
                                    {role.permissions.map((p) => (
                                        <span
                                            key={p}
                                            className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-medium bg-canvas-card text-body-main border border-line shadow-2xs"
                                        >
                                            {p}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                )}

                {/* Direct User Overrides (PBAC) */}
                {(profileUser.direct_permissions?.length ?? 0) > 0 && (
                    <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 space-y-3">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-lg bg-emerald-100/70 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                                    <Sparkles className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-200">
                                            Direct User Overrides (PBAC)
                                        </h4>
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300">
                                            {profileUser.direct_permissions.length} grant{profileUser.direct_permissions.length === 1 ? '' : 's'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <span className="text-[10px] font-semibold tracking-wider uppercase text-emerald-600 dark:text-emerald-400">
                                Direct Assignment
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                            {profileUser.direct_permissions.map((p) => (
                                <span
                                    key={p}
                                    className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-medium bg-canvas-card text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800/60 shadow-2xs"
                                >
                                    {p}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
