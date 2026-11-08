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
            <div className="p-6 bg-surface text-gray-900 dark:text-gray-100">
                <div className="flex items-center justify-between pb-4 border-b border-line">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-accent/10 dark:bg-accent/20 flex items-center justify-center">
                            {isEdit ? (
                                <Pencil className="w-4 h-4 text-accent-light" />
                            ) : (
                                <FolderPlus className="w-4 h-4 text-accent-light" />
                            )}
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold">
                                {isEdit ? 'Edit Module' : 'Create Module'}
                            </h2>
                            <p className="text-[0.6875rem] text-gray-500 dark:text-gray-400">
                                {isEdit
                                    ? 'Update module information and publication status'
                                    : 'Add a new learning module to this course'}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-raised dark:hover:bg-raised transition"
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
                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-line dark:bg-raised dark:text-white shadow-xs focus:border-accent focus:ring-accent text-xs"
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
                                className="rounded border-gray-300 dark:border-line text-accent shadow-xs focus:ring-accent"
                            />
                            <div className="text-xs">
                                <span className="font-semibold text-gray-900 dark:text-white">Publish this module</span>
                                <p className="text-[0.6875rem] text-gray-500 dark:text-gray-400">
                                    When unchecked, this module remains hidden as a draft.
                                </p>
                            </div>
                        </label>
                        <InputError message={errors.is_published} className="mt-1" />
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-line">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-3.5 py-2 rounded-lg border border-line hover:bg-raised dark:hover:bg-raised text-xs font-semibold text-gray-700 dark:text-gray-300 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition"
                        >
                            {processing ? 'Saving...' : isEdit ? 'Update Module' : 'Create Module'}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}

