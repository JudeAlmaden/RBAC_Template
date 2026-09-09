import React from 'react';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { Award } from 'lucide-react';

export default function PromoteUserModal({
    show,
    onClose,
    selectedUser,
    meta,
    onConfirm,
}) {
    return (
        <Modal show={show} onClose={onClose}>
            <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-lg bg-[#5B5FC7]/10 dark:bg-[#5B5FC7]/20 flex items-center justify-center">
                        <Award className="w-5 h-5 text-[#5B5FC7] dark:text-[#8A8DE2]" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white">
                            Promote to Super Admin
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Current: {meta.superAdminCount}/2 Super Admins
                        </p>
                    </div>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300 mb-3 leading-relaxed">
                    Promote <strong>{selectedUser?.name}</strong> to <strong>Super Admin</strong>.
                </p>
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-lg text-xs text-amber-800 dark:text-amber-300 mb-6">
                    The system enforces a strict ceiling of <strong>two (2) Super Admins</strong>. Once
                    promoted, this account will share full administrative authority.
                </div>
                <div className="flex justify-end gap-2.5">
                    <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
                    <PrimaryButton
                        onClick={onConfirm}
                        className="!bg-[#5B5FC7] hover:!bg-[#484CB8]"
                    >
                        Confirm Promotion
                    </PrimaryButton>
                </div>
            </div>
        </Modal>
    );
}
