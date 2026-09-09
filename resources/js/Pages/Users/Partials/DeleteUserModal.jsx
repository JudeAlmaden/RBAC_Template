import React, { useState, useEffect } from 'react';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import { AlertTriangle, Trash2, UserX, ShieldAlert, Loader2 } from 'lucide-react';

export default function DeleteUserModal({
    show,
    onClose,
    selectedUser,
    onConfirm,
    onDeactivate,
}) {
    const [loading, setLoading] = useState(true);
    const [checkData, setCheckData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!show || !selectedUser) {
            setLoading(true);
            setCheckData(null);
            setError(null);
            return;
        }

        let isCancelled = false;
        setLoading(true);
        setError(null);

        fetch(route('users.deletion-check', selectedUser.id), {
            headers: {
                Accept: 'application/json',
            },
        })
            .then((res) => {
                if (!res.ok) throw new Error('Failed to inspect account dependencies.');
                return res.json();
            })
            .then((data) => {
                if (!isCancelled) {
                    setCheckData(data);
                    setLoading(false);
                }
            })
            .catch((err) => {
                if (!isCancelled) {
                    setError(err.message || 'An error occurred.');
                    setLoading(false);
                }
            });

        return () => {
            isCancelled = true;
        };
    }, [show, selectedUser?.id]);

    const canDelete = checkData?.can_delete ?? false;
    const summary = checkData?.summary ?? [];
    const isActive = selectedUser?.is_active ?? true;

    return (
        <Modal show={show} onClose={onClose} maxWidth="md">
            <div className="p-6">
                {/* Loading State */}
                {loading ? (
                    <div className="py-8 flex flex-col items-center justify-center text-center">
                        <Loader2 className="w-8 h-8 text-[#5B5FC7] animate-spin mb-3" />
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                            Inspecting account audit history & records...
                        </p>
                        <p className="text-[11px] text-gray-400 mt-1">
                            Checking for associated activity logs and system dependencies
                        </p>
                    </div>
                ) : error ? (
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-9 h-9 rounded-lg bg-red-100 dark:bg-red-950/50 flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                    Error Checking Dependencies
                                </h3>
                                <p className="text-xs text-red-500">{error}</p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2.5 mt-6">
                            <SecondaryButton onClick={onClose}>Close</SecondaryButton>
                        </div>
                    </div>
                ) : canDelete ? (
                    /* Clean Account: Can be permanently deleted */
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/50 flex items-center justify-center flex-shrink-0">
                                <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                    Permanently Delete Account
                                </h3>
                                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                                    No dependent records found • Eligible for purge
                                </p>
                            </div>
                        </div>

                        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                            Are you sure you want to permanently delete{' '}
                            <strong className="text-gray-900 dark:text-white">{selectedUser?.name}</strong>{' '}
                            <span className="text-gray-400 font-mono">({selectedUser?.email})</span>?
                        </p>

                        <div className="p-3 bg-gray-50 dark:bg-[#15151A] rounded-lg border border-[#E8E8EC] dark:border-[#26262D] text-[11px] text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                            This account has no associated audit logs or foreign records. Deletion is permanent and cannot be undone.
                        </div>

                        <div className="flex items-center justify-between">
                            {isActive && onDeactivate ? (
                                <button
                                    type="button"
                                    onClick={onDeactivate}
                                    className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-medium"
                                >
                                    Or deactivate instead
                                </button>
                            ) : <div />}

                            <div className="flex gap-2.5">
                                <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
                                <DangerButton onClick={onConfirm}>
                                    Permanently Delete
                                </DangerButton>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Account With History: Cannot be deleted, must deactivate */
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center flex-shrink-0">
                                <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                    {isActive ? 'Deactivate Account' : 'Account Inactive'}
                                </h3>
                                <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                                    Audit Protection Active • Deletion Blocked
                                </p>
                            </div>
                        </div>

                        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
                            <strong className="text-gray-900 dark:text-white">{selectedUser?.name}</strong>{' '}
                            cannot be permanently deleted because it is tied to historical business records:
                        </p>

                        {/* Summary Badges */}
                        {summary.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                                {summary.map((item, idx) => (
                                    <span
                                        key={idx}
                                        className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-medium bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border border-amber-200/70 dark:border-amber-800/40"
                                    >
                                        • {item}
                                    </span>
                                ))}
                            </div>
                        )}

                        <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-lg border border-amber-200/60 dark:border-amber-900/40 text-[11px] text-amber-800 dark:text-amber-300 mb-6 leading-relaxed">
                            {isActive
                                ? 'To maintain data consistency and audit trail compliance, this account will be deactivated instead. Deactivation immediately revokes sign-in access while preserving all historical records.'
                                : 'This account is already deactivated. Historical records remain preserved for audit compliance.'}
                        </div>

                        <div className="flex justify-end gap-2.5">
                            <SecondaryButton onClick={onClose}>
                                {isActive ? 'Cancel' : 'Close'}
                            </SecondaryButton>
                            {isActive && onDeactivate && (
                                <button
                                    type="button"
                                    onClick={onDeactivate}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-sm transition"
                                >
                                    <UserX className="w-3.5 h-3.5" />
                                    Deactivate Account
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
}
