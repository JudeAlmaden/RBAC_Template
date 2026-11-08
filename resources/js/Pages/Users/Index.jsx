import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useDebounce } from '@/hooks/useDebounce';
import { UserPlus, Search, History, Users } from 'lucide-react';
import ActivityLogTable from '@/Components/ActivityLogTable';
import SetupLinkNotice from '@/Components/SetupLinkNotice';

import UserTable from './Partials/UserTable';
import CreateUserModal from './Partials/CreateUserModal';
import EditUserModal from './Partials/EditUserModal';
import DeleteUserModal from './Partials/DeleteUserModal';
import PromoteUserModal from './Partials/PromoteUserModal';
import TransferSuperAdminModal from './Partials/TransferSuperAdminModal';
import DemoteUserModal from './Partials/DemoteUserModal';

export default function Index({ users, filters, meta, availableRoles = [], activityLogs = null }) {
    const [activeTab, setActiveTab]       = useState('accounts');
    const [search, setSearch]         = useState(filters.search || '');
    const [roleFilter, setRoleFilter] = useState(filters.role || '');
    const debouncedSearch = useDebounce(search, 300);

    // Modal Visibility States
    const [createModalOpen, setCreateModalOpen]     = useState(false);
    const [editModalOpen, setEditModalOpen]         = useState(false);
    const [deleteModalOpen, setDeleteModalOpen]     = useState(false);
    const [transferModalOpen, setTransferModalOpen] = useState(false);
    const [promoteModalOpen, setPromoteModalOpen]   = useState(false);
    const [demoteModalOpen, setDemoteModalOpen]     = useState(false);
    const [selectedUser, setSelectedUser]           = useState(null);

    // Forms
    const createForm = useForm({ name: '', email: '', password: '', roles: [] });
    const editForm   = useForm({ name: '', email: '', password: '', roles: [] });

    // Server-side debounced search & filtering
    useEffect(() => {
        router.get(
            route('users.index'),
            { search: debouncedSearch, role: roleFilter },
            { preserveState: true, replace: true }
        );
    }, [debouncedSearch, roleFilter]);

    // Helpers
    const formatRoleText = (role) => {
        if (role === 'super_admin') return 'Super Admin';
        if (role === 'admin') return 'Admin';
        if (role === 'user') return 'User';
        return role ? role.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()) : 'User';
    };

    // Modal Handlers
    const handleOpenEdit = (user) => {
        setSelectedUser(user);
        editForm.setData({
            name: user.name,
            email: user.email,
            password: '',
            roles: (user.roles || []).filter((r) => r !== 'user'),
        });
        editForm.clearErrors();
        setEditModalOpen(true);
    };

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        createForm.post(route('users.store'), {
            onSuccess: () => {
                setCreateModalOpen(false);
                createForm.reset();
            },
        });
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        if (!selectedUser) return;
        editForm.put(route('users.update', selectedUser.id), {
            onSuccess: () => {
                setEditModalOpen(false);
                setSelectedUser(null);
            },
        });
    };

    const handleDeleteSubmit = () => {
        if (!selectedUser) return;
        router.delete(route('users.destroy', selectedUser.id), {
            onSuccess: () => {
                setDeleteModalOpen(false);
                setSelectedUser(null);
            },
        });
    };

    const handleDeactivateFromModal = () => {
        if (!selectedUser) return;
        router.patch(route('users.toggle-status', selectedUser.id), {}, {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteModalOpen(false);
                setSelectedUser(null);
            },
        });
    };

    const handlePromoteSubmit = () => {
        if (!selectedUser) return;
        router.post(route('users.promote-super-admin', selectedUser.id), {}, {
            onSuccess: () => {
                setPromoteModalOpen(false);
                setSelectedUser(null);
            },
        });
    };

    const handleTransferSubmit = () => {
        if (!selectedUser) return;
        router.post(route('users.transfer-super-admin', selectedUser.id), {}, {
            onSuccess: () => {
                setTransferModalOpen(false);
                setSelectedUser(null);
            },
        });
    };

    const handleDemoteSubmit = () => {
        if (!selectedUser) return;
        router.post(route('users.demote-super-admin', selectedUser.id), {}, {
            onSuccess: () => {
                setDemoteModalOpen(false);
                setSelectedUser(null);
            },
        });
    };

    const handleToggleStatus = (user) => {
        if (!user) return;
        router.patch(route('users.toggle-status', user.id), {}, {
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h1 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                        Account Management
                    </h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Manage user directory, PBAC authorization, and super admin capacity
                    </p>
                </div>
            }
        >
            <Head title="Accounts Directory" />

            <div className="space-y-6">
                <SetupLinkNotice />

                {/* Tab Bar — shown whenever the user has any account management access */}
                {(meta.canCreateUser || activityLogs !== null) && (
                    <div className="flex items-center gap-1 border-b border-line">
                        <button
                            onClick={() => setActiveTab('accounts')}
                            className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition -mb-px ${
                                activeTab === 'accounts'
                                    ? 'border-brand text-brand'
                                    : 'border-transparent text-body-muted hover:text-body-main'
                            }`}
                        >
                            <Users className="w-3.5 h-3.5" />
                            Accounts
                        </button>
                        {activityLogs !== null && (
                            <button
                                onClick={() => setActiveTab('history')}
                                className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition -mb-px ${
                                    activeTab === 'history'
                                        ? 'border-brand text-brand'
                                        : 'border-transparent text-body-muted hover:text-body-main'
                                }`}
                            >
                                <History className="w-3.5 h-3.5" />
                                Activity History
                                {activityLogs?.total > 0 && (
                                    <span className="ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-brand/10 text-brand">
                                        {activityLogs.total}
                                    </span>
                                )}
                            </button>
                        )}
                    </div>
                )}

                {/* Accounts Tab */}
                {activeTab === 'accounts' && (
                    <>
                        {/* Search, Filter & Creation Controls */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-center gap-3 flex-1">
                                <div className="relative w-full sm:w-80">
                                    <Search className="w-4 h-4 text-body-subtle absolute left-3 top-2.5" />
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Search by name or email..."
                                        className="w-full pl-9 pr-4 py-2 text-xs bg-canvas-card border border-line rounded-lg text-body-main placeholder-body-subtle focus:ring-2 focus:ring-brand focus:outline-none transition"
                                    />
                                </div>

                                {meta.canCreateAdmin && (
                                    <select
                                        value={roleFilter}
                                        onChange={(e) => setRoleFilter(e.target.value)}
                                        className="text-xs bg-canvas-card border border-line rounded-lg px-3 py-2 text-body-main focus:ring-2 focus:ring-brand focus:outline-none"
                                    >
                                        <option value="">All Roles</option>
                                        <option value="super_admin">Super Admin</option>
                                        <option value="admin">Admin</option>
                                        <option value="user">User</option>
                                        {availableRoles
                                            .filter((r) => !['super_admin', 'admin', 'user'].includes(r.name))
                                            .map((r) => (
                                                <option key={r.id} value={r.name}>
                                                    {formatRoleText(r.name)}
                                                </option>
                                            ))}
                                    </select>
                                )}
                            </div>

                            {meta.canCreateUser && (
                                <button
                                    onClick={() => {
                                        createForm.reset();
                                        setCreateModalOpen(true);
                                    }}
                                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-brand hover:bg-brand-hover text-white text-xs font-semibold shadow-sm transition"
                                >
                                    <UserPlus className="w-4 h-4" />
                                    Add Account
                                </button>
                            )}
                        </div>

                        {/* Modular Accounts Table */}
                        <UserTable
                            users={users}
                            meta={meta}
                            formatRoleText={formatRoleText}
                            onEdit={handleOpenEdit}
                            onDelete={(u) => {
                                setSelectedUser(u);
                                setDeleteModalOpen(true);
                            }}
                            onPromote={(u) => {
                                setSelectedUser(u);
                                setPromoteModalOpen(true);
                            }}
                            onTransfer={(u) => {
                                setSelectedUser(u);
                                setTransferModalOpen(true);
                            }}
                            onDemote={(u) => {
                                setSelectedUser(u);
                                setDemoteModalOpen(true);
                            }}
                            onToggleStatus={handleToggleStatus}
                        />
                    </>
                )}

                {/* Activity History Tab */}
                {activeTab === 'history' && (
                    <div className="bg-canvas-card rounded-xl border border-line shadow-sm overflow-hidden">
                        <ActivityLogTable
                            logs={activityLogs}
                            emptyLabel="No account activity recorded yet."
                            logRouteKey="users.index"
                            currentFilters={{ log_search: filters.log_search, log_action: filters.log_action }}
                            preserveParams={{ search: filters.search, role: filters.role }}
                        />
                    </div>
                )}
            </div>

            {/* Modular Modals */}
            <CreateUserModal
                show={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                form={createForm}
                onSubmit={handleCreateSubmit}
                meta={meta}
                availableRoles={availableRoles}
                formatRoleText={formatRoleText}
            />

            <EditUserModal
                show={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                form={editForm}
                onSubmit={handleEditSubmit}
                selectedUser={selectedUser}
                meta={meta}
                availableRoles={availableRoles}
                formatRoleText={formatRoleText}
            />

            <DeleteUserModal
                show={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                selectedUser={selectedUser}
                onConfirm={handleDeleteSubmit}
                onDeactivate={handleDeactivateFromModal}
            />

            <PromoteUserModal
                show={promoteModalOpen}
                onClose={() => setPromoteModalOpen(false)}
                selectedUser={selectedUser}
                meta={meta}
                onConfirm={handlePromoteSubmit}
            />

            <TransferSuperAdminModal
                show={transferModalOpen}
                onClose={() => setTransferModalOpen(false)}
                selectedUser={selectedUser}
                onConfirm={handleTransferSubmit}
            />

            <DemoteUserModal
                show={demoteModalOpen}
                onClose={() => setDemoteModalOpen(false)}
                selectedUser={selectedUser}
                onConfirm={handleDemoteSubmit}
            />
        </AuthenticatedLayout>
    );
}
