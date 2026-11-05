import React, { useState } from 'react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import { FolderPlus, Pencil, X } from 'lucide-react';

export default function ModuleModal({
    show,
    onClose,
    onSubmit,
    form,
    isEdit = false,
}) {
    const { data, setData, processing, errors, reset } = form;

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <Modal show={show} onClose={handleClose} maxWidth="md">
            <div className="p-6 bg-white dark:bg-[#15151A] text-gray-900 dark:text-gray-100">
                <div className="flex items-center justify-between pb-4 border-b border-[#E8E8EC] dark:border-[#26262D]">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#5B5FC7]/10 dark:bg-[#5B5FC7]/20 flex items-center justify-center">
                            {isEdit ? (
                                <Pencil className="w-4 h-4 text-[#5B5FC7] dark:text-[#8A8DE2]" />
                            ) : (
                                <FolderPlus className="w-4 h-4 text-[#5B5FC7] dark:text-[#8A8DE2]" />
                            )}
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold">
                                {isEdit ? 'Edit Module' : 'Create Module'}
                            </h2>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                {isEdit
                                    ? 'Update module information and publication status'
                                    : 'Add a new learning module to this course'}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1C1C24] transition"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <form onSubmit={onSubmit} className="mt-5 space-y-4 text-xs">
                    <div>
                        <InputLabel htmlFor="module_title" value="Module Title" className="text-xs" />
                        <TextInput
                            id="module_title"
                            type="text"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            className="mt-1 block w-full text-xs"
                            placeholder="e.g. Introduction to Threat Modeling"
                            required
                        />
                        <InputError message={errors.title} className="mt-1" />
                    </div>

                    <div>
                        <InputLabel htmlFor="module_description" value="Description" className="text-xs" />
                        <textarea
                            id="module_description"
                            rows={3}
                            value={data.description || ''}
                            onChange={(e) => setData('description', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-[#26262D] dark:bg-[#1C1C24] dark:text-white shadow-xs focus:border-[#5B5FC7] focus:ring-[#5B5FC7] text-xs"
                            placeholder="Brief summary of what this module covers..."
                        />
                        <InputError message={errors.description} className="mt-1" />
                    </div>

                    <div className="pt-2">
                        <label className="flex items-center gap-2.5 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={!!data.is_published}
                                onChange={(e) => setData('is_published', e.target.checked)}
                                className="rounded border-gray-300 dark:border-[#26262D] text-[#5B5FC7] shadow-xs focus:ring-[#5B5FC7]"
                            />
                            <div className="text-xs">
                                <span className="font-semibold text-gray-900 dark:text-white">Publish this module</span>
                                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                    When unchecked, this module remains hidden as a draft.
                                </p>
                            </div>
                        </label>
                        <InputError message={errors.is_published} className="mt-1" />
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-[#E8E8EC] dark:border-[#26262D]">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-3.5 py-2 rounded-lg border border-[#E8E8EC] dark:border-[#26262D] hover:bg-gray-50 dark:hover:bg-[#1C1C24] text-xs font-semibold text-gray-700 dark:text-gray-300 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-4 py-2 rounded-lg bg-[#5B5FC7] hover:bg-[#484CB8] text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition"
                        >
                            {processing ? 'Saving...' : isEdit ? 'Update Module' : 'Create Module'}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}

