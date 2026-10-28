import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import ActivityLogTable from '@/Components/ActivityLogTable';
import {
    ShieldCheck,
    Plus,
    Trash2,
    Lock,
    Users,
    KeyRound,
    AlertTriangle,
    Sliders,
    Layers,
    History,
    Power,
    Crown,
    Shield,
    User,
    Sparkles,
} from 'lucide-react';

export default function Index({ roles, categorizedPermissions, activityLogs = null, logFilters = {} }) {
    const { auth } = usePage().props;
    const can = auth.can || {};
    const [activeTab, setActiveTab]         = useState('roles');
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);

    // Create form
    const createForm = useForm({
        name: '',
        permissions: [],
        max_active_users: '',
    });

    // Edit form
    const editForm = useForm({
        name: '',
        permissions: [],
        max_active_users: '',
    });

    const formatRoleName = (name) => {
        if (name === 'super_admin') return 'Super Admin';
        if (name === 'admin') return 'Admin';
        if (name === 'user') return 'User';
        return name.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    };

    const getRoleSubtitle = (role) => {
        if (role.name === 'super_admin') return 'Full system authority & ownership';
        if (role.name === 'admin') return 'Standard administrative access';
        if (role.name === 'user') return 'Default basic user account';
        return `Custom role • ${role.name}`;
    };

    const getRoleIconConfig = (roleName) => {
        switch (roleName) {
            case 'super_admin':
                return {
                    icon: Crown,
                    containerClass: 'bg-[#5B5FC7]/10 text-[#5B5FC7] dark:bg-[#5B5FC7]/20 dark:text-[#8A8DE2]',
                };
            case 'admin':
                return {
                    icon: Shield,
                    containerClass: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400',
                };
            case 'user':
                return {
                    icon: User,
                    containerClass: 'bg-gray-100 text-gray-700 dark:bg-[#252530] dark:text-gray-300',
                };
            default:
                return {
                    icon: Sparkles,
                    containerClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
                };
        }
    };

    const formatPermLabel = (perm) => {
        return perm
            .split(' ')
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');
    };

    // Open Edit modal
    const handleOpenEdit = (role) => {
        setSelectedRole(role);
        editForm.setData({
            name: role.name,
            permissions: [...role.permissions],
            max_active_users: role.maxActiveUsers !== null && role.maxActiveUsers !== undefined ? role.maxActiveUsers : '',
        });
        editForm.clearErrors();
        setEditModalOpen(true);
    };

    // Open Delete modal
    const handleOpenDelete = (role) => {
        setSelectedRole(role);
        setDeleteModalOpen(true);
    };

    // Submit Create
    const handleCreateSubmit = (e) => {
        e.preventDefault();
        createForm.post(route('roles.store'), {
            onSuccess: () => {
                setCreateModalOpen(false);
                createForm.reset();
            },
        });
    };

    // Submit Edit
    const handleEditSubmit = (e) => {
        e.preventDefault();
        if (!selectedRole) return;
        editForm.put(route('roles.update', selectedRole.id), {
            onSuccess: () => {
                setEditModalOpen(false);
                setSelectedRole(null);
            },
        });
    };

    // Submit Delete
    const handleDeleteSubmit = () => {
        if (!selectedRole) return;
        router.delete(route('roles.destroy', selectedRole.id), {
            onSuccess: () => {
                setDeleteModalOpen(false);
                setSelectedRole(null);
            },
        });
    };

    // Toggle Role Active Status
    const handleToggleRoleStatus = (role) => {
        if (!role) return;
        router.patch(route('roles.toggle-status', role.id), {}, {
            preserveScroll: true,
            onSuccess: () => {
                setEditModalOpen(false);
                setSelectedRole(null);
            },
        });
    };

    // Toggle permission in create form
    const toggleCreatePerm = (permName) => {
        const current = createForm.data.permissions;
        if (current.includes(permName)) {
            createForm.setData('permissions', current.filter((p) => p !== permName));
        } else {
            createForm.setData('permissions', [...current, permName]);
        }
    };

    // Toggle permission in edit form
    const toggleEditPerm = (permName) => {
        const current = editForm.data.permissions;
        if (current.includes(permName)) {
            editForm.setData('permissions', current.filter((p) => p !== permName));
        } else {
            editForm.setData('permissions', [...current, permName]);
        }
    };

    // Select/Deselect category in create
    const toggleCreateCategory = (perms) => {
        const permNames = perms.map((p) => p.name);
        const allSelected = permNames.every((p) => createForm.data.permissions.includes(p));
        if (allSelected) {
            createForm.setData('permissions', createForm.data.permissions.filter((p) => !permNames.includes(p)));
        } else {
            const merged = Array.from(new Set([...createForm.data.permissions, ...permNames]));
            createForm.setData('permissions', merged);
        }
    };

    // Select/Deselect category in edit
    const toggleEditCategory = (perms) => {
        const permNames = perms.map((p) => p.name);
        const allSelected = permNames.every((p) => editForm.data.permissions.includes(p));
        if (allSelected) {
            editForm.setData('permissions', editForm.data.permissions.filter((p) => !permNames.includes(p)));
        } else {
            const merged = Array.from(new Set([...editForm.data.permissions, ...permNames]));
            editForm.setData('permissions', merged);
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h1 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                        Roles & Permissions
                    </h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Manage Role-Based and Permission-Based Access Control (RBAC / PBAC)
                    </p>
                </div>
            }
        >
            <Head title="Roles & Permissions" />

            <div className="space-y-6">
                {/* Tab Bar */}
                <div className="flex items-center gap-1 border-b border-[#E8E8EC] dark:border-[#26262D]">
                    <button
                        onClick={() => setActiveTab('roles')}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition -mb-px ${
                            activeTab === 'roles'
                                ? 'border-[#5B5FC7] text-[#5B5FC7] dark:text-[#8A8DE2]'
                                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                        }`}
                    >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Roles
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition -mb-px ${
                            activeTab === 'history'
                                ? 'border-[#5B5FC7] text-[#5B5FC7] dark:text-[#8A8DE2]'
                                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                        }`}
                    >
                        <History className="w-3.5 h-3.5" />
                        Activity History
                        {activityLogs?.total > 0 && (
                            <span className="ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#5B5FC7]/10 text-[#5B5FC7] dark:bg-[#5B5FC7]/20 dark:text-[#8A8DE2]">
                                {activityLogs.total}
                            </span>
                        )}
                    </button>
                </div>

                {/* Roles Tab */}
                {activeTab === 'roles' && (
                    <>
                        {/* Header Action */}
                        {can.manageRoles && (
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4">
                                <button
                                    onClick={() => {
                                        createForm.reset();
                                        setCreateModalOpen(true);
                                    }}
                                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#5B5FC7] hover:bg-[#484CB8] text-white text-xs font-semibold shadow-sm transition"
                                >
                                    <Plus className="w-4 h-4" />
                                    Create Custom Role
                                </button>
                            </div>
                        )}

                        {/* Roles Table */}
                        <div className="bg-white dark:bg-[#15151A] rounded-xl border border-[#E8E8EC] dark:border-[#26262D] shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                <tr className="border-b border-[#E8E8EC] dark:border-[#26262D] bg-[#FAFAFC] dark:bg-[#1C1C24] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[10px]">
                                    <th className="py-3.5 px-5 w-[30%]">Role Name</th>
                                    <th className="py-3.5 px-5 w-[24%]">Personnel / Active Seats</th>
                                    <th className="py-3.5 px-5 w-[32%]">Granted Permissions</th>
                                    <th className="py-3.5 px-5 w-[14%] text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E8E8EC] dark:divide-[#26262D] text-gray-700 dark:text-gray-300">
                                {roles.map((role) => {
                                    const isFull = role.maxActiveUsers !== null && role.activeUsersCount >= role.maxActiveUsers;
                                    return (
                                        <tr key={role.id} className="hover:bg-gray-50/60 dark:hover:bg-[#1C1C24]/50 transition">
                                            <td className="py-4 px-5">
                                                <div className="flex items-center gap-3">
                                                    {(() => {
                                                        const { icon: RoleIcon, containerClass } = getRoleIconConfig(role.name);
                                                        return (
                                                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${containerClass}`}>
                                                                <RoleIcon className="w-4 h-4" />
                                                            </div>
                                                        );
                                                    })()}
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-1.5 whitespace-nowrap">
                                                            <span className={`font-semibold text-xs ${!role.is_active ? 'text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                                                                {formatRoleName(role.name)}
                                                            </span>
                                                            {role.isProtected && (
                                                                <Lock className="w-3 h-3 text-gray-400 dark:text-gray-500 shrink-0" title="System protected role" />
                                                            )}
                                                            {!role.is_active && (
                                                                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                                                                    (Disabled)
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-[11px] text-gray-400 truncate mt-0.5">
                                                            {getRoleSubtitle(role)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="py-4 px-5 whitespace-nowrap">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex items-center gap-1.5 text-gray-800 dark:text-gray-200 font-medium text-xs">
                                                            <Users className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                                            <span>
                                                                <strong className="text-gray-900 dark:text-white font-semibold">{role.activeUsersCount}</strong>
                                                                {role.maxActiveUsers !== null ? (
                                                                    <span className="text-gray-500 dark:text-gray-400">/{role.maxActiveUsers} active</span>
                                                                ) : (
                                                                    <span className="text-gray-500 dark:text-gray-400"> active</span>
                                                                )}
                                                            </span>
                                                        </div>

                                                    </div>
                                                    <div className="text-[11px] text-gray-400 pl-5">
                                                        {role.usersCount} total account{role.usersCount === 1 ? '' : 's'}
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="py-4 px-5">
                                                {role.name === 'super_admin' ? (
                                                    <div className="flex items-center gap-2 ">
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#5B5FC7]/10 dark:bg-[#5B5FC7]/20 text-[#5B5FC7] dark:text-[#8A8DE2] border border-[#5B5FC7]/20">
                                                            <ShieldCheck className="w-3.5 h-3.5 text-[#5B5FC7] dark:text-[#8A8DE2]" />
                                                            Full System Access
                                                        </span>
                                                    </div>
                                                ) : role.permissions.length === 0 ? (
                                                    <span className="text-gray-400 text-xs">Standard privileges (Default)</span>
                                                ) : (
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        {role.permissions.slice(0, 2).map((p) => (
                                                            <span
                                                                key={p}
                                                                className="inline-block px-2 py-0.5 rounded-md text-[11px] font-medium bg-gray-100 dark:bg-[#202028] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-[#2C2C38]"
                                                            >
                                                                {formatPermLabel(p)}
                                                            </span>
                                                        ))}
                                                        {role.permissions.length > 2 && (
                                                            <span className="inline-block px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-gray-50 dark:bg-[#1A1A22] text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-[#2C2C38]">
                                                                +{role.permissions.length - 2} more
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </td>

                                            <td className="py-4 px-5 text-right">
                                                <div className="flex items-center justify-end">
                                                    {(!role.isProtected || can.isSuperAdmin) ? (
                                                        <button
                                                            onClick={() => handleOpenEdit(role)}
                                                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-[#22222C] hover:bg-gray-200 dark:hover:bg-[#2A2A38] transition"
                                                            title="Configure Permissions"
                                                        >
                                                            <Sliders className="w-3.5 h-3.5 text-gray-400" />
                                                            Configure
                                                        </button>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-400 dark:text-gray-500 cursor-not-allowed" title="System-protected role">
                                                            <Lock className="w-3.5 h-3.5" />
                                                            Protected
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        </div>
                    </div>
                </>
                )}

                {/* Activity History Tab */}
                {activeTab === 'history' && (
                    <div className="bg-white dark:bg-[#15151A] rounded-xl border border-[#E8E8EC] dark:border-[#26262D] shadow-sm overflow-hidden">
                        <ActivityLogTable
                            logs={activityLogs}
                            emptyLabel="No role activity recorded yet."
                            logRouteKey="roles.index"
                            currentFilters={{ log_search: logFilters.log_search, log_action: logFilters.log_action }}
                            preserveParams={{}}
                        />
                    </div>
                )}
            </div>

            {/* ── CREATE ROLE MODAL ─────────────────────────────────────────── */}
            <Modal show={createModalOpen} onClose={() => setCreateModalOpen(false)} maxWidth="2xl">
                <form onSubmit={handleCreateSubmit} className="flex flex-col max-h-[calc(100vh-3.5rem)] overflow-hidden">
                    <div className="p-5 sm:p-6 pb-4 border-b border-[#E8E8EC] dark:border-[#26262D] shrink-0 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#5B5FC7]/10 dark:bg-[#5B5FC7]/20 flex items-center justify-center shrink-0">
                            <ShieldCheck className="w-5 h-5 text-[#5B5FC7] dark:text-[#8A8DE2]" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-gray-900 dark:text-white">Create Custom Role</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Define role identifier and select granted permissions</p>
                        </div>
                    </div>

                    <div className="p-5 sm:p-6 overflow-y-auto flex-1 min-h-0 space-y-4">
                        <div>
                            <InputLabel htmlFor="create-role-name" value="Role Name" />
                            <TextInput
                                id="create-role-name"
                                value={createForm.data.name}
                                onChange={(e) => createForm.setData('name', e.target.value)}
                                placeholder="e.g. HR Manager, Support Lead, Auditor"
                                className="mt-1 block w-full text-xs"
                                required
                            />
                            <InputError message={createForm.errors.name} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel htmlFor="create-max-users" value="Maximum Active Personnel Capacity (Optional)" />
                            <TextInput
                                id="create-max-users"
                                type="number"
                                min="1"
                                value={createForm.data.max_active_users}
                                onChange={(e) => createForm.setData('max_active_users', e.target.value)}
                                placeholder="Leave empty for unlimited active personnel"
                                className="mt-1 block w-full text-xs"
                            />
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                                Cap the number of active users for this role. Deactivated users do not count against this limit.
                            </p>
                            <InputError message={createForm.errors.max_active_users} className="mt-1" />
                        </div>

                        <div>
                            <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Select Granted Permissions
                            </div>

                            <div className="space-y-3">
                                {categorizedPermissions.map((group) => {
                                    const groupPermNames = group.permissions.map((p) => p.name);
                                    const allChecked = groupPermNames.every((p) => createForm.data.permissions.includes(p));

                                    return (
                                        <div
                                            key={group.category}
                                            className="border border-[#E8E8EC] dark:border-[#26262D] rounded-xl p-3.5 bg-gray-50/50 dark:bg-[#1A1A22]"
                                        >
                                            <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-[#E8E8EC] dark:border-[#26262D]">
                                                <span className="font-semibold text-xs text-gray-900 dark:text-white">
                                                    {group.category}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => toggleCreateCategory(group.permissions)}
                                                    className="text-[11px] font-medium text-[#5B5FC7] dark:text-[#8A8DE2] hover:underline"
                                                >
                                                    {allChecked ? 'Deselect All' : 'Select All'}
                                                </button>
                                            </div>

                                            <div className="space-y-2">
                                                {group.permissions.map((perm) => {
                                                    const checked = createForm.data.permissions.includes(perm.name);
                                                    return (
                                                        <label
                                                            key={perm.id}
                                                            className="flex items-start gap-2.5 cursor-pointer select-none group"
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={checked}
                                                                onChange={() => toggleCreatePerm(perm.name)}
                                                                className="mt-0.5 rounded border-gray-300 dark:border-gray-700 text-[#5B5FC7] focus:ring-[#5B5FC7] dark:bg-[#15151A]"
                                                            />
                                                            <div>
                                                                <div className="font-mono text-xs font-semibold text-gray-800 dark:text-gray-200 group-hover:text-[#5B5FC7] dark:group-hover:text-[#8A8DE2] transition">
                                                                    {perm.name}
                                                                </div>
                                                                <div className="text-[11px] text-gray-500 dark:text-gray-400">
                                                                    {perm.description}
                                                                </div>
                                                            </div>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="p-4 px-5 sm:px-6 border-t border-[#E8E8EC] dark:border-[#26262D] bg-gray-50/75 dark:bg-[#181820] shrink-0 flex items-center justify-end gap-2.5">
                        <SecondaryButton onClick={() => setCreateModalOpen(false)}>Cancel</SecondaryButton>
                        <PrimaryButton disabled={createForm.processing} className="!bg-[#5B5FC7] hover:!bg-[#484CB8]">
                            Create Role
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* ── CONFIGURE / EDIT ROLE MODAL ──────────────────────────────── */}
            <Modal show={editModalOpen} onClose={() => setEditModalOpen(false)} maxWidth="2xl">
                <form onSubmit={handleEditSubmit} className="flex flex-col max-h-[calc(100vh-3.5rem)] overflow-hidden">
                    <div className="p-5 sm:p-6 pb-4 border-b border-[#E8E8EC] dark:border-[#26262D] shrink-0 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#5B5FC7]/10 dark:bg-[#5B5FC7]/20 flex items-center justify-center shrink-0">
                            <Sliders className="w-5 h-5 text-[#5B5FC7] dark:text-[#8A8DE2]" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                Configure Role: {formatRoleName(selectedRole?.name || '')}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Adjust permissions and role configuration
                            </p>
                        </div>
                    </div>

                    <div className="p-5 sm:p-6 overflow-y-auto flex-1 min-h-0 space-y-4">
                        <div>
                            <InputLabel htmlFor="edit-role-name" value="Role Name" />
                            <TextInput
                                id="edit-role-name"
                                value={editForm.data.name}
                                onChange={(e) => editForm.setData('name', e.target.value)}
                                disabled={selectedRole?.isProtected}
                                className={`mt-1 block w-full text-xs ${selectedRole?.isProtected ? 'opacity-70 bg-gray-100 dark:bg-[#1A1A22] cursor-not-allowed' : ''
                                    }`}
                                required
                            />
                            {selectedRole?.isProtected && (
                                <p className="text-[11px] text-gray-400 mt-1">
                                    System protected roles cannot be renamed.
                                </p>
                            )}
                            <InputError message={editForm.errors.name} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel htmlFor="edit-max-users" value="Maximum Active Personnel Capacity" />
                            <TextInput
                                id="edit-max-users"
                                type="number"
                                min="1"
                                value={editForm.data.max_active_users}
                                onChange={(e) => editForm.setData('max_active_users', e.target.value)}
                                placeholder="Leave empty for unlimited active personnel"
                                className="mt-1 block w-full text-xs"
                            />
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                                Active user seats limit. Deactivated users do not count against this capacity.
                            </p>
                            <InputError message={editForm.errors.max_active_users} className="mt-1" />
                        </div>

                        <div>
                            <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Role Permissions
                            </div>

                            <div className="space-y-3">
                                {categorizedPermissions.map((group) => {
                                    const groupPermNames = group.permissions.map((p) => p.name);
                                    const allChecked = groupPermNames.every((p) => editForm.data.permissions.includes(p));

                                    return (
                                        <div
                                            key={group.category}
                                            className="border border-[#E8E8EC] dark:border-[#26262D] rounded-xl p-3.5 bg-gray-50/50 dark:bg-[#1A1A22]"
                                        >
                                            <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-[#E8E8EC] dark:border-[#26262D]">
                                                <span className="font-semibold text-xs text-gray-900 dark:text-white">
                                                    {group.category}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => toggleEditCategory(group.permissions)}
                                                    className="text-[11px] font-medium text-[#5B5FC7] dark:text-[#8A8DE2] hover:underline"
                                                >
                                                    {allChecked ? 'Deselect All' : 'Select All'}
                                                </button>
                                            </div>

                                            <div className="space-y-2">
                                                {group.permissions.map((perm) => {
                                                    const checked = editForm.data.permissions.includes(perm.name);
                                                    const isLockedSuperAdmin = selectedRole?.name === 'super_admin' && [
                                                        'manage users', 'manage admins', 'promote super admin', 'transfer super admin', 'manage roles', 'assign roles'
                                                    ].includes(perm.name);

                                                    return (
                                                        <label
                                                            key={perm.id}
                                                            className={`flex items-start gap-2.5 select-none ${isLockedSuperAdmin ? 'cursor-not-allowed opacity-80' : 'cursor-pointer group'
                                                                }`}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={checked}
                                                                disabled={isLockedSuperAdmin}
                                                                onChange={() => toggleEditPerm(perm.name)}
                                                                className="mt-0.5 rounded border-gray-300 dark:border-gray-700 text-[#5B5FC7] focus:ring-[#5B5FC7] dark:bg-[#15151A]"
                                                            />
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-mono text-xs font-semibold text-gray-800 dark:text-gray-200">
                                                                        {perm.name}
                                                                    </span>
                                                                    {isLockedSuperAdmin && (
                                                                        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-sans">
                                                                            (Required for Super Admin)
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="text-[11px] text-gray-500 dark:text-gray-400">
                                                                    {perm.description}
                                                                </div>
                                                            </div>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Danger Zone: Only for custom non-protected roles */}
                        {!selectedRole?.isProtected && (
                            <div className="mt-6 pt-5 border-t border-[#E8E8EC] dark:border-[#26262D]">
                                <div className="text-xs font-semibold text-red-600 dark:text-red-400 mb-2.5 flex items-center gap-1.5">
                                    <AlertTriangle className="w-3.5 h-3.5" />
                                    Danger Zone
                                </div>

                                <div className="border border-red-200/60 dark:border-red-900/30 rounded-xl bg-red-50/20 dark:bg-red-950/10 divide-y divide-red-100 dark:divide-red-900/20 overflow-hidden">
                                    {/* Role Status Toggle Row */}
                                    <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div>
                                            <div className="text-xs font-semibold text-gray-900 dark:text-white">
                                                {selectedRole?.is_active ? 'Deactivate this role' : 'Activate this role'}
                                            </div>
                                            <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                                                {selectedRole?.is_active
                                                    ? 'Prevent this role from being assigned to any new accounts.'
                                                    : 'Enable this role so administrators can assign it to accounts.'}
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleToggleRoleStatus(selectedRole)}
                                            className={`shrink-0 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 w-36 rounded-lg text-xs font-medium transition border ${
                                                selectedRole?.is_active
                                                    ? 'border-amber-200 dark:border-amber-900/50 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-900/50'
                                                    : 'border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
                                            }`}
                                        >
                                            <Power className="w-3.5 h-3.5" />
                                            {selectedRole?.is_active ? 'Deactivate Role' : 'Activate Role'}
                                        </button>
                                    </div>

                                    {/* Delete Role Row */}
                                    <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div>
                                            <div className="text-xs font-semibold text-gray-900 dark:text-white">
                                                Delete this custom role
                                            </div>
                                            <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                                                {selectedRole?.usersCount > 0 ? (
                                                    <span className="text-amber-600 dark:text-amber-400 font-medium">
                                                        Cannot delete: {selectedRole.usersCount} user(s) currently assigned. Reassign them first.
                                                    </span>
                                                ) : (
                                                    'Permanently remove this role from the system. Irreversible action.'
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            disabled={selectedRole?.usersCount > 0}
                                            onClick={() => {
                                                setEditModalOpen(false);
                                                handleOpenDelete(selectedRole);
                                            }}
                                            className={`shrink-0 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 w-36 rounded-lg text-xs font-medium transition border ${
                                                selectedRole?.usersCount > 0
                                                    ? 'opacity-40 cursor-not-allowed bg-gray-100 dark:bg-[#202028] text-gray-400 border-gray-200 dark:border-[#2C2C38]'
                                                    : 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/40 border-red-200 dark:border-red-900/50'
                                            }`}
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            Delete Role
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Standard, clean modal footer */}
                    <div className="p-4 px-5 sm:px-6 border-t border-[#E8E8EC] dark:border-[#26262D] bg-gray-50/75 dark:bg-[#181820] shrink-0 flex items-center justify-end gap-2.5">
                        <SecondaryButton onClick={() => setEditModalOpen(false)}>Cancel</SecondaryButton>
                        <PrimaryButton disabled={editForm.processing} className="!bg-[#5B5FC7] hover:!bg-[#484CB8]">
                            Save Changes
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* ── DELETE ROLE MODAL ────────────────────────────────────────── */}
            <Modal show={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-lg bg-red-100 dark:bg-red-950/50 flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-gray-900 dark:text-white">Delete Custom Role</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Irreversible Action</p>
                        </div>
                    </div>

                    <p className="text-xs text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                        Are you sure you want to permanently delete the custom role <strong>{selectedRole?.name}</strong>?
                    </p>

                    {selectedRole?.usersCount > 0 && (
                        <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-lg text-xs text-amber-800 dark:text-amber-300 mb-4">
                            There are currently <strong>{selectedRole.usersCount} user(s)</strong> assigned to this role. You must reassign those users to another role before deleting.
                        </div>
                    )}

                    <div className="flex justify-end gap-2.5">
                        <SecondaryButton onClick={() => setDeleteModalOpen(false)}>Cancel</SecondaryButton>
                        <DangerButton
                            disabled={selectedRole?.usersCount > 0}
                            onClick={handleDeleteSubmit}
                        >
                            Delete Role
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
