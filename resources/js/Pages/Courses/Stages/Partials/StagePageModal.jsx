import React from 'react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import { Layout, Pencil, Plus, X } from 'lucide-react';
import { LAYOUT_TYPE_DETAILS } from './StageFormModal';

export default function StagePageModal({
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
        <Modal show={show} onClose={handleClose} maxWidth="lg">
            <div className="flex flex-col max-h-[90vh] bg-white dark:bg-[#15151A] text-gray-900 dark:text-gray-100">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E8EC] dark:border-[#26262D] shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#5B5FC7]/10 dark:bg-[#5B5FC7]/20 flex items-center justify-center">
                            {isEdit ? (
                                <Pencil className="w-4 h-4 text-[#5B5FC7] dark:text-[#8A8DE2]" />
                            ) : (
                                <Plus className="w-4 h-4 text-[#5B5FC7] dark:text-[#8A8DE2]" />
                            )}
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold">
                                {isEdit ? 'Edit Container Page' : 'Add Container Page'}
                            </h2>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                Set the page title and responsive layout container for your components
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

                <form onSubmit={onSubmit} className="flex flex-col min-h-0 flex-1">
                    {/* Scrollable Body */}
                    <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4 text-xs">
                        {/* Title */}
                        <div>
                            <InputLabel htmlFor="page_title" value="Page Title" className="text-xs font-semibold" />
                            <TextInput
                                id="page_title"
                                type="text"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                className="mt-1 block w-full text-xs"
                                placeholder="e.g. Page 1: Concept Walkthrough"
                                required
                            />
                            <InputError message={errors.title} className="mt-1" />
                        </div>

                        {/* Layout Selector */}
                        <div>
                            <InputLabel value="Container Layout" className="text-xs font-semibold" />
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-2">
                                Choose how content components are arranged inside this page
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {Object.entries(LAYOUT_TYPE_DETAILS).map(([layoutKey, details]) => {
                                    const isSelected = data.layout_type === layoutKey;
                                    return (
                                        <button
                                            key={layoutKey}
                                            type="button"
                                            onClick={() => setData('layout_type', layoutKey)}
                                            className={`p-3 rounded-lg border text-left transition flex flex-col justify-between ${
                                                isSelected
                                                    ? 'border-[#5B5FC7] bg-[#5B5FC7]/10 dark:bg-[#5B5FC7]/20 ring-1 ring-[#5B5FC7]'
                                                    : 'border-[#E8E8EC] dark:border-[#26262D] hover:bg-gray-50 dark:hover:bg-[#1C1C24]'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold text-xs text-gray-900 dark:text-white">
                                                    {details.label}
                                                </span>
                                                {isSelected && (
                                                    <span className="w-2 h-2 rounded-full bg-[#5B5FC7]" />
                                                )}
                                            </div>
                                            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                                                {details.desc}
                                            </p>
                                        </button>
                                    );
                                })}
                            </div>
                            <InputError message={errors.layout_type} className="mt-1" />
                        </div>

                        {/* Visibility Checkbox */}
                        <div className="pt-2">
                            <label className="flex items-center gap-2.5 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={!!data.is_visible}
                                    onChange={(e) => setData('is_visible', e.target.checked)}
                                    className="rounded border-gray-300 dark:border-[#26262D] text-[#5B5FC7] shadow-xs focus:ring-[#5B5FC7]"
                                />
                                <div className="text-xs">
                                    <span className="font-semibold text-gray-900 dark:text-white">Page visible to learners</span>
                                    <p className="text-[10px] text-gray-400">Uncheck to hide this page while drafting components</p>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-2 px-6 py-4 border-t border-[#E8E8EC] dark:border-[#26262D] shrink-0">
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
                            {processing ? 'Saving...' : isEdit ? 'Update Page' : 'Create Page'}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}

