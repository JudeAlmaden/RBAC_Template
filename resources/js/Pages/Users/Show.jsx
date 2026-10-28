import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import EditUserModal from './Partials/EditUserModal';
import DeleteUserModal from './Partials/DeleteUserModal';
import PromoteUserModal from './Partials/PromoteUserModal';
import TransferSuperAdminModal from './Partials/TransferSuperAdminModal';
import DemoteUserModal from './Partials/DemoteUserModal';
import UserProfileCard from './Partials/UserProfileCard';
import UserPermissionsMatrix from './Partials/UserPermissionsMatrix';
import UserActivitySection from './Partials/UserActivitySection';
import { ArrowLeft } from 'lucide-react';

export default function UserShow({
    profileUser,
    logsBy,
    logsOn,
    filters = {},
    metrics = {},
    meta = {},
    availableRoles = [],
}) {
    const [editModalOpen, setEditModalOpen]         = useState(false);
    const [deleteModalOpen, setDeleteModalOpen]     = useState(false);
    const [promoteModalOpen, setPromoteModalOpen]   = useState(false);
    const [transferModalOpen, setTransferModalOpen] = useState(false);
    const [demoteModalOpen, setDemoteModalOpen]     = useState(false);

    const editForm = useForm({
        name:     profileUser.name,
        email:    profileUser.email,
        password: '',
        roles:    (profileUser.roles ?? []).filter((r) => r !== 'user'),
    });

    const isSelf   = profileUser.id === meta.currentUserId;
    const userCan  = profileUser.can ?? {};

    const hasAnyAction = !isSelf && (
        userCan.update || userCan.toggleStatus ||
        userCan.promoteSuperAdmin || userCan.transferSuperAdmin ||
        userCan.demoteSuperAdmin || userCan.delete
    );

    const hasSecondaryAction = !isSelf && (
        userCan.toggleStatus ||
        userCan.promoteSuperAdmin || userCan.transferSuperAdmin ||
        userCan.demoteSuperAdmin || userCan.delete
    );

    const formatRoleText = (role) => {
        if (role === 'super_admin') return 'Super Admin';
        if (role === 'admin')       return 'Admin';
        if (role === 'user')        return 'User';
        return role ? role.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()) : 'User';
    };

    /* ── Modal handlers ── */
    const handleOpenEdit = () => {
        editForm.setData({
            name: profileUser.name,
            email: profileUser.email,
            password: '',
            roles: (profileUser.roles ?? []).filter((r) => r !== 'user'),
        });
        editForm.clearErrors();
        setEditModalOpen(true);
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        editForm.put(route('users.update', profileUser.id), {
            onSuccess: () => setEditModalOpen(false),
        });
    };

    const handleDeleteSubmit = () =>
        router.delete(route('users.destroy', profileUser.id), {
            onSuccess: () => setDeleteModalOpen(false),
        });

    const handleDeactivateFromModal = () =>
        router.patch(route('users.toggle-status', profileUser.id), {}, {
            preserveScroll: true,
            onSuccess: () => setDeleteModalOpen(false),
        });

    const handleToggleStatus = () =>
        router.patch(route('users.toggle-status', profileUser.id), {}, {
            preserveScroll: true,
        });

    const handlePromoteSubmit = () =>
        router.post(route('users.promote-super-admin', profileUser.id), {}, {
            onSuccess: () => setPromoteModalOpen(false),
        });

    const handleTransferSubmit = () =>
        router.post(route('users.transfer-super-admin', profileUser.id), {}, {
            onSuccess: () => setTransferModalOpen(false),
        });

    const handleDemoteSubmit = () =>
        router.post(route('users.demote-super-admin', profileUser.id), {}, {
            onSuccess: () => setDemoteModalOpen(false),
        });

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-3">
                    <Link
                        href={route('users.index')}
                        className="p-1.5 rounded-lg border border-[#E8E8EC] dark:border-[#2A2A35] bg-white dark:bg-[#1A1A22] text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition"
                        title="Back to Accounts"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {profileUser.name}
                            </h2>
                            {isSelf && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold border border-indigo-200 dark:border-indigo-800">
                                    You
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            User Profile, Role Permissions &amp; Dedicated Audit Trail
                        </p>
                    </div>
                </div>
            }
        >
            <Head title={`User Profile - ${profileUser.name}`} />

            <div className="space-y-6">
                {/* ── User Overview Profile Card ──────────────────────────── */}
                <UserProfileCard
                    profileUser={profileUser}
                    metrics={metrics}
                    userCan={userCan}
                    hasAnyAction={hasAnyAction}
                    hasSecondaryAction={hasSecondaryAction}
                    onEdit={handleOpenEdit}
                    onToggleStatus={handleToggleStatus}
                    onPromote={() => setPromoteModalOpen(true)}
                    onTransfer={() => setTransferModalOpen(true)}
                    onDemote={() => setDemoteModalOpen(true)}
                    onDelete={() => setDeleteModalOpen(true)}
                />

                {/* ── Effective Permissions Matrix ──────────────────────────── */}
                <UserPermissionsMatrix
                    profileUser={profileUser}
                    formatRoleText={formatRoleText}
                />

                {/* ── Dual-Perspective Activity Trail ──────────────────────── */}
                <UserActivitySection
                    profileUser={profileUser}
                    logsBy={logsBy}
                    logsOn={logsOn}
                    filters={filters}
                />
            </div>

            {/* ── Management Modals ─────────────────────────────────────── */}
            <EditUserModal
                show={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                form={editForm}
                onSubmit={handleEditSubmit}
                selectedUser={profileUser}
                meta={meta}
                availableRoles={availableRoles}
                formatRoleText={formatRoleText}
            />
            <DeleteUserModal
                show={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                selectedUser={profileUser}
                onConfirm={handleDeleteSubmit}
                onDeactivate={handleDeactivateFromModal}
            />
            <PromoteUserModal
                show={promoteModalOpen}
                onClose={() => setPromoteModalOpen(false)}
                selectedUser={profileUser}
                meta={meta}
                onConfirm={handlePromoteSubmit}
            />
            <TransferSuperAdminModal
                show={transferModalOpen}
                onClose={() => setTransferModalOpen(false)}
                selectedUser={profileUser}
                onConfirm={handleTransferSubmit}
            />
            <DemoteUserModal
                show={demoteModalOpen}
                onClose={() => setDemoteModalOpen(false)}
                selectedUser={profileUser}
                onConfirm={handleDemoteSubmit}
            />
        </AuthenticatedLayout>
    );
}
