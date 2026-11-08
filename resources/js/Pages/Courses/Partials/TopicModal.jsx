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
            <div className="p-6 bg-surface text-gray-900 dark:text-gray-100">
                <div className="flex items-center justify-between pb-4 border-b border-line">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-accent/10 dark:bg-accent/20 flex items-center justify-center">
                            {isEdit ? (
                                <Pencil className="w-4 h-4 text-accent-light" />
                            ) : (
                                <BookOpen className="w-4 h-4 text-accent-light" />
                            )}
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold">
                                {isEdit ? 'Edit Topic / Lesson' : 'Create Topic / Lesson'}
                            </h2>
                            <p className="text-[0.6875rem] text-gray-500 dark:text-gray-400">
                                {isEdit
                                    ? `Update topic in "${moduleTitle}"`
                                    : `Adding new lesson inside "${moduleTitle}"`}
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
                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-line dark:bg-raised dark:text-white shadow-xs focus:border-accent focus:ring-accent text-xs"
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
                                className="rounded border-gray-300 dark:border-line text-accent shadow-xs focus:ring-accent"
                            />
                            <div className="text-xs">
                                <span className="font-semibold text-gray-900 dark:text-white">Publish this topic</span>
                                <p className="text-[0.6875rem] text-gray-500 dark:text-gray-400">
                                    Learners can access this lesson immediately when published.
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
                            {processing ? 'Saving...' : isEdit ? 'Update Topic' : 'Create Topic'}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}

