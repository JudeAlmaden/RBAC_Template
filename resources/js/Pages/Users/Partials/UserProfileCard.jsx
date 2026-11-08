import React from 'react';
import Avatar from '@/Components/Avatar';
import UserProfileActions from './UserProfileActions';
import {
    Calendar,
    Shield,
    Activity,
    Clock,
} from 'lucide-react';

function formatDate(dateStr) {
    if (!dateStr) return '—';
    // If it has timestamp attached e.g. "Oct 28, 2026 7:39 AM", return "Oct 28, 2026"
    const parts = dateStr.split(' ');
    if (parts.length >= 3) {
        return parts.slice(0, 3).join(' ');
    }
    return dateStr;
}

export default function UserProfileCard({
    profileUser,
    metrics = {},
    userCan = {},
    hasAnyAction,
    onEdit,
    onToggleStatus,
    onPromote,
    onTransfer,
    onDemote,
    onDelete,
}) {
    const actionsCount = metrics.actions_performed ?? 0;
    const changesCount = metrics.changes_received ?? 0;

    return (
        <div className="p-6 rounded-xl bg-canvas-card border border-line shadow-sm">
            {/* Top Identity Row: Avatar + Info (Left) and Actions Dropdown (Top Right) */}
            <div className="flex items-start justify-between gap-4 pb-5 border-b border-line">
                <div className="flex items-center gap-4">
                    <Avatar name={profileUser.name} size="w-14 h-14 text-base" />

                    <div>
                        {/* Title Row: User Name + ID right next to it */}
                        <div className="flex items-center gap-2">
                            <h1 className="text-lg font-bold text-body-main tracking-tight">
                                {profileUser.name}
                            </h1>
                            <span className="text-xs font-normal text-body-subtle">
                                #{profileUser.id}
                            </span>
                        </div>

                        {/* Email — clean sans-serif secondary text */}
                        <p className="text-sm text-body-muted mt-0.5">
                            {profileUser.email}
                        </p>

                        {/* Roles & Minimal Status Indicator */}
                        <div className="flex items-center gap-2.5 mt-2 flex-wrap">
                            {profileUser.roles.map((r) => (
                                <span
                                    key={r}
                                    className="px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider bg-brand/10 text-brand border border-brand/20"
                                >
                                    {r.replace(/_/g, ' ')}
                                </span>
                            ))}

                            {/* Minimal non-colorful status indicator */}
                            <span className="inline-flex items-center gap-1.5 text-xs text-body-muted">
                                <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                        profileUser.is_active ? 'bg-emerald-400' : 'bg-gray-400'
                                    }`}
                                />
                                {profileUser.is_active ? 'Active' : 'Deactivated'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right: Actions Dropdown in the top-right corner */}
                {hasAnyAction && (
                    <div className="shrink-0">
                        <UserProfileActions
                            userCan={userCan}
                            profileUser={profileUser}
                            onEdit={onEdit}
                            onToggleStatus={onToggleStatus}
                            onPromote={onPromote}
                            onTransfer={onTransfer}
                            onDemote={onDemote}
                            onDelete={onDelete}
                        />
                    </div>
                )}
            </div>

            {/* Bottom Metadata & Metrics Grid: Consistent spacing and typography */}
            <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-canvas-surface border border-line flex items-center justify-center shrink-0">
                        <Calendar className="w-4 h-4 text-body-subtle" />
                    </div>
                    <div className="min-w-0">
                        <span className="text-[10px] uppercase font-medium text-body-subtle block">
                            Member Since
                        </span>
                        <span className="text-xs font-semibold text-body-main truncate block mt-0.5">
                            {formatDate(profileUser.created_at)}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-canvas-surface border border-line flex items-center justify-center shrink-0">
                        <Shield className="w-4 h-4 text-body-subtle" />
                    </div>
                    <div className="min-w-0">
                        <span className="text-[10px] uppercase font-medium text-body-subtle block">
                            Email Status
                        </span>
                        <span className="text-xs font-semibold text-body-main truncate block mt-0.5">
                            {profileUser.email_verified ? 'Verified' : 'Unverified'}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-canvas-surface border border-line flex items-center justify-center shrink-0">
                        <Activity className="w-4 h-4 text-body-subtle" />
                    </div>
                    <div className="min-w-0">
                        <span className="text-[10px] uppercase font-medium text-body-subtle block">
                            Actions Executed
                        </span>
                        <span className="text-xs font-semibold text-body-main truncate block mt-0.5">
                            {actionsCount} {actionsCount === 1 ? 'action' : 'actions'}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-canvas-surface border border-line flex items-center justify-center shrink-0">
                        <Clock className="w-4 h-4 text-body-subtle" />
                    </div>
                    <div className="min-w-0">
                        <span className="text-[10px] uppercase font-medium text-body-subtle block">
                            Changes Received
                        </span>
                        <span className="text-xs font-semibold text-body-main truncate block mt-0.5">
                            {changesCount} {changesCount === 1 ? 'change' : 'changes'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
