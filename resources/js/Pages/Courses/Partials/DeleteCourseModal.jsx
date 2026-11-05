import React from 'react';
import Modal from '@/Components/Modal';
import DangerButton from '@/Components/DangerButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { Trash2 } from 'lucide-react';

export default function DeleteCourseModal({ show, onClose, course, onConfirm }) {
    if (!course) return null;

    return (
        <Modal show={show} onClose={onClose} maxWidth="sm">
            <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                        <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white">Delete Course</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">This action cannot be undone.</p>
                    </div>
                </div>

                <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                    Are you sure you want to delete{' '}
                    <span className="font-semibold text-gray-900 dark:text-white">"{course.title}"</span>?
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
                    The course will be soft-deleted. Existing enrollments will remain intact.
                </p>

                <div className="flex justify-end gap-2.5">
                    <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
                    <DangerButton onClick={onConfirm}>Delete Course</DangerButton>
                </div>
            </div>
        </Modal>
    );
}

