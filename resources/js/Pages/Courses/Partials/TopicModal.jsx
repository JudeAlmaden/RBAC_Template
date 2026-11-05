import React from 'react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import { BookOpen, Pencil, X, Clock } from 'lucide-react';

export default function TopicModal({
    show,
    onClose,
    onSubmit,
    form,
    moduleTitle = '',
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
                                <BookOpen className="w-4 h-4 text-[#5B5FC7] dark:text-[#8A8DE2]" />
                            )}
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold">
                                {isEdit ? 'Edit Topic / Lesson' : 'Create Topic / Lesson'}
                            </h2>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                {isEdit
                                    ? `Update topic in "${moduleTitle}"`
                                    : `Adding new lesson inside "${moduleTitle}"`}
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
                        <InputLabel htmlFor="topic_title" value="Topic / Lesson Title" className="text-xs" />
                        <TextInput
                            id="topic_title"
                            type="text"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            className="mt-1 block w-full text-xs"
                            placeholder="e.g. STRIDE Methodology Overview"
                            required
                        />
                        <InputError message={errors.title} className="mt-1" />
                    </div>

                    <div>
                        <InputLabel htmlFor="topic_estimated_minutes" value="Estimated Duration (minutes)" className="text-xs" />
                        <div className="relative mt-1">
                            <TextInput
                                id="topic_estimated_minutes"
                                type="number"
                                min="1"
                                max="1440"
                                value={data.estimated_minutes || ''}
                                onChange={(e) => setData('estimated_minutes', e.target.value)}
                                className="block w-full text-xs pl-8"
                                placeholder="15"
                            />
                            <Clock className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        </div>
                        <InputError message={errors.estimated_minutes} className="mt-1" />
                    </div>

                    <div>
                        <InputLabel htmlFor="topic_description" value="Description / Summary" className="text-xs" />
                        <textarea
                            id="topic_description"
                            rows={3}
                            value={data.description || ''}
                            onChange={(e) => setData('description', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-[#26262D] dark:bg-[#1C1C24] dark:text-white shadow-xs focus:border-[#5B5FC7] focus:ring-[#5B5FC7] text-xs"
                            placeholder="Key takeaways and lesson objectives..."
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
                                <span className="font-semibold text-gray-900 dark:text-white">Publish this topic</span>
                                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                    Learners can access this lesson immediately when published.
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
                            {processing ? 'Saving...' : isEdit ? 'Update Topic' : 'Create Topic'}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}

