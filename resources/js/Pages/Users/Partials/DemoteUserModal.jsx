import React from 'react';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { ShieldMinus } from 'lucide-react';

export default function DemoteUserModal({
    show,
    onClose,
    selectedUser,
    onConfirm,
}) {
    return (
        <Modal show={show} onClose={onClose}>
            <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center">
                        <ShieldMinus className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white">
                            Demote Super Admin
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Revert Account to Admin
                        </p>
                    </div>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300 mb-3 leading-relaxed">
                    Demote <strong>{selectedUser?.name}</strong> from <strong>Super Admin</strong> to{' '}
                    <strong>Admin</strong>.
                </p>
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-lg text-xs text-amber-800 dark:text-amber-300 mb-6">
                    This account will no longer possess root Super Admin authority. There will remain at
                    least one active Super Admin.
                </div>
                <div className="flex justify-end gap-2.5">
                    <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
                    <PrimaryButton
                        onClick={onConfirm}
                        className="!bg-amber-600 hover:!bg-amber-700 !text-white"
                    >
                        Confirm Demotion
                    </PrimaryButton>
                </div>
            </div>
        </Modal>
    );
}
