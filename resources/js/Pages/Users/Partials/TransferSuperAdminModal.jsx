import React from 'react';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { ArrowRightLeft } from 'lucide-react';

export default function TransferSuperAdminModal({
    show,
    onClose,
    selectedUser,
    onConfirm,
}) {
    return (
        <Modal show={show} onClose={onClose}>
            <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-950/40 flex items-center justify-center">
                        <ArrowRightLeft className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white">
                            Transfer Super Admin Privileges
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Role Swap & Self-Demotion
                        </p>
                    </div>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300 mb-3 leading-relaxed">
                    Transfer your Super Admin privileges to <strong>{selectedUser?.name}</strong>.
                </p>
                <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/60 rounded-lg text-xs text-red-800 dark:text-red-300 mb-6 space-y-1">
                    <div>
                        &bull; <strong>{selectedUser?.name}</strong> will become a{' '}
                        <strong>Super Admin</strong>.
                    </div>
                    <div>
                        &bull; Your account will automatically be demoted to an <strong>Admin</strong>.
                    </div>
                </div>
                <div className="flex justify-end gap-2.5">
                    <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
                    <PrimaryButton
                        onClick={onConfirm}
                        className="!bg-[#5B5FC7] hover:!bg-[#484CB8]"
                    >
                        Confirm Transfer
                    </PrimaryButton>
                </div>
            </div>
        </Modal>
    );
}
