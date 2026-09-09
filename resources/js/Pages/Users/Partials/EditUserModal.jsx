import React from 'react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { Shield, Award, Check } from 'lucide-react';

export default function EditUserModal({
    show,
    onClose,
    form,
    onSubmit,
    selectedUser,
    meta,
    availableRoles,
    formatRoleText,
}) {
    const isSuperAdminUser = selectedUser?.role === 'super_admin' || selectedUser?.roles?.includes('super_admin');

    const selectableRoles = [
        ...(meta.canCreateAdmin ? [{ name: 'admin', label: 'Administrator', description: 'Administrative privileges and management' }] : []),
        ...(meta.canAssignRoles || meta.canCreateAdmin
            ? availableRoles
                .filter((r) => !['super_admin', 'admin', 'user'].includes(r.name))
                .map((r) => ({
                    name: r.name,
                    label: formatRoleText(r.name),
                    description: 'Custom defined role permissions',
                }))
            : []
        ),
        ...(isSuperAdminUser ? [{ name: 'super_admin', label: 'Super Admin', description: 'Highest executive authority' }] : []),
    ];

    const currentRoles = Array.isArray(form.data.roles)
        ? form.data.roles.filter((r) => r !== 'user')
        : [];

    const toggleRole = (roleName) => {
        if (!meta.canAssignRoles && !meta.canCreateAdmin) return;
        if (currentRoles.includes(roleName)) {
            form.setData('roles', currentRoles.filter((r) => r !== roleName));
        } else {
            form.setData('roles', [...currentRoles, roleName]);
        }
    };

    const roleError = form.errors.roles || form.errors.role || (
        Object.keys(form.errors).find((k) => k.startsWith('roles.'))
            ? form.errors[Object.keys(form.errors).find((k) => k.startsWith('roles.'))]
            : null
    );

    return (
        <Modal show={show} onClose={onClose}>
            <form onSubmit={onSubmit} className="p-6">
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                    Edit Account: {selectedUser?.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
                    Update account credentials and assign elevated or app roles
                </p>

                <div className="space-y-4">
                    <div>
                        <InputLabel htmlFor="edit-name" value="Full Name" />
                        <TextInput
                            id="edit-name"
                            value={form.data.name}
                            onChange={(e) => form.setData('name', e.target.value)}
                            className="mt-1 block w-full text-xs"
                            required
                        />
                        <InputError message={form.errors.name} className="mt-1" />
                    </div>

                    <div>
                        <InputLabel htmlFor="edit-email" value="Email Address" />
                        <TextInput
                            id="edit-email"
                            type="email"
                            value={form.data.email}
                            onChange={(e) => form.setData('email', e.target.value)}
                            className="mt-1 block w-full text-xs"
                            required
                        />
                        <InputError message={form.errors.email} className="mt-1" />
                    </div>

                    <div>
                        <InputLabel htmlFor="edit-password" value="New Password (optional)" />
                        <TextInput
                            id="edit-password"
                            type="password"
                            placeholder="Leave blank to keep unchanged"
                            value={form.data.password}
                            onChange={(e) => form.setData('password', e.target.value)}
                            className="mt-1 block w-full text-xs"
                        />
                        <InputError message={form.errors.password} className="mt-1" />
                    </div>

                    {(meta.canAssignRoles || meta.canCreateAdmin) && selectableRoles.length > 0 && (
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <InputLabel value="Elevated & App Roles" />
                                <span className="text-[11px] text-gray-400">
                                    {currentRoles.length === 0 ? 'None (Standard User)' : `${currentRoles.length} selected`}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 border border-[#E8E8EC] dark:border-[#26262D] rounded-lg bg-[#FAFAFC] dark:bg-[#121217]">
                                {selectableRoles.map((role) => {
                                    const isSelected = currentRoles.includes(role.name);

                                    return (
                                        <div
                                            key={role.name}
                                            onClick={() => toggleRole(role.name)}
                                            className={`flex items-start gap-2.5 p-2.5 rounded-md border text-xs cursor-pointer transition select-none ${
                                                isSelected
                                                    ? 'bg-white dark:bg-[#1C1C24] border-[#5B5FC7] shadow-xs'
                                                    : 'bg-white/60 dark:bg-[#181820]/60 border-[#E8E8EC] dark:border-[#26262D] hover:border-gray-300 dark:hover:border-gray-700'
                                            }`}
                                        >
                                            <div
                                                className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center border transition shrink-0 ${
                                                    isSelected
                                                        ? 'bg-[#5B5FC7] border-[#5B5FC7] text-white'
                                                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-[#15151A]'
                                                }`}
                                            >
                                                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                                                    <span>{role.label}</span>
                                                    {role.name === 'super_admin' && (
                                                        <Award className="w-3 h-3 text-[#5B5FC7] shrink-0" />
                                                    )}
                                                    {role.name === 'admin' && (
                                                        <Shield className="w-3 h-3 text-blue-500 shrink-0" />
                                                    )}
                                                </div>
                                                <p className="text-[10px] text-gray-400 truncate">
                                                    {role.description}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <InputError message={roleError} className="mt-1" />
                        </div>
                    )}
                </div>

                <div className="mt-6 flex justify-end gap-2.5">
                    <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
                    <PrimaryButton
                        disabled={form.processing}
                        className="!bg-[#5B5FC7] hover:!bg-[#484CB8]"
                    >
                        Save Changes
                    </PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}
