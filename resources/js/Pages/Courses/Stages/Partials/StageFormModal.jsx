import React from 'react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import { Layers, Pencil, X } from 'lucide-react';

export const SECTION_TYPE_DETAILS = {
    activate: {
        label: 'Activate',
        desc: 'Prior knowledge activation, priming questions, diagnostic warm-ups',
        badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800',
    },
    encode: {
        label: 'Encode',
        desc: 'Direct instruction, conceptual walkthroughs, guided interactive media',
        badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800',
    },
    retrieve: {
        label: 'Retrieve',
        desc: 'Active recall prompts, low-stakes comprehension checks',
        badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
    },
    anchor: {
        label: 'Anchor',
        desc: 'Real-world application case studies, scenario modeling',
        badge: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800',
    },
    deepen: {
        label: 'Deepen',
        desc: 'Advanced extension exercises, edge case challenges',
        badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800',
    },
    lab: {
        label: 'Lab',
        desc: 'Hands-on sandbox exercises, practical walkthroughs',
        badge: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800',
    },
    assessment: {
        label: 'Assessment',
        desc: 'Formal graded evaluations, milestone checkpoints, summative tests',
        badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
    },
    custom: {
        label: 'Custom',
        desc: 'Modular stage with custom configuration',
        badge: 'bg-gray-100 text-gray-700 dark:bg-raised dark:text-gray-300 border border-gray-200 dark:border-line',
    },
};

export const LAYOUT_TYPE_DETAILS = {
    single_column: {
        label: 'Single Column (Standard)',
        desc: 'Default reading, conceptual narrative, and lecture flow',
    },
    split_two_column: {
        label: 'Split Two-Column',
        desc: 'Left column instruction/video, right column notes or exercises',
    },
    cinema_focus: {
        label: 'Cinema Focus',
        desc: 'Maximized video or interactive canvas with collapsible drawer',
    },
    tabbed_stepper: {
        label: 'Tabbed Stepper',
        desc: 'Sequential milestone walkthrough or step-by-step tabs',
    },
};

export default function StageFormModal({
    show,
    onClose,
    onSubmit,
    form,
    availableSectionTypes = [],
    availableLayoutTypes = [],
    isEdit = false,
}) {
    const { data, setData, processing, errors, reset } = form;

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <Modal show={show} onClose={handleClose} maxWidth="lg">
            <div className="flex flex-col max-h-[90vh] bg-surface text-gray-900 dark:text-gray-100">

                {/* Sticky header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-line shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-accent/10 dark:bg-accent/20 flex items-center justify-center">
                            {isEdit ? (
                                <Pencil className="w-4 h-4 text-accent-light" />
                            ) : (
                                <Layers className="w-4 h-4 text-accent-light" />
                            )}
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold">
                                {isEdit ? 'Edit Learning Stage' : 'Add Pedagogical Stage'}
                            </h2>
                            <p className="text-[0.6875rem] text-gray-500 dark:text-gray-400">
                                Configure the learning stage type, layout container, and guidelines
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

                <form onSubmit={onSubmit} className="flex flex-col min-h-0 flex-1">
                {/* Scrollable body */}
                <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4 text-xs">
                    {/* Stage Type */}
                    <div>
                        <InputLabel value="Learning Stage Type" className="text-xs font-semibold" />
                        <div className="grid grid-cols-2 gap-2 mt-1.5">
                            {(availableSectionTypes.length > 0 ? availableSectionTypes : Object.keys(SECTION_TYPE_DETAILS)).map((type) => {
                                const details = SECTION_TYPE_DETAILS[type] || { label: type, desc: '' };
                                const isSelected = data.section_type === type;
                                return (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => {
                                            setData('section_type', type);
                                            if (!data.title || (!isEdit && Object.values(SECTION_TYPE_DETAILS).some(d => data.title.startsWith(d.label)))) {
                                                setData('title', `${details.label}: Stage Title`);
                                            }
                                        }}
                                        className={`p-2.5 rounded-lg border text-left transition flex flex-col justify-between ${
                                            isSelected
                                                ? 'border-accent bg-accent/10 dark:bg-accent/20 ring-1 ring-accent'
                                                : 'border-line hover:bg-raised dark:hover:bg-raised'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold text-xs text-gray-900 dark:text-white capitalize">
                                                {details.label}
                                            </span>
                                            {isSelected && (
                                                <span className="w-2 h-2 rounded-full bg-accent" />
                                            )}
                                        </div>
                                        <p className="text-[0.625rem] text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                            {details.desc}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                        <InputError message={errors.section_type} className="mt-1" />
                    </div>

                    {/* Stage Title */}
                    <div>
                        <InputLabel htmlFor="stage_title" value="Stage Title" className="text-xs" />
                        <TextInput
                            id="stage_title"
                            type="text"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            className="mt-1 block w-full text-xs"
                            placeholder="e.g. Encode: SQL Injection Vulnerabilities"
                            required
                        />
                        <InputError message={errors.title} className="mt-1" />
                    </div>

                    {/* Instructions */}
                    <div>
                        <InputLabel htmlFor="instructions" value="Learner Instructions & Guidance (Optional)" className="text-xs" />
                        <textarea
                            id="instructions"
                            rows={3}
                            value={data.instructions || ''}
                            onChange={(e) => setData('instructions', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-line dark:bg-raised dark:text-white shadow-xs focus:border-accent focus:ring-accent text-xs"
                            placeholder="Provide step-by-step guidance or learning objectives for this specific stage..."
                        />
                        <InputError message={errors.instructions} className="mt-1" />
                    </div>

                    {/* Checkboxes */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <label className="flex items-center gap-2.5 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={!!data.is_required}
                                onChange={(e) => setData('is_required', e.target.checked)}
                                className="rounded border-gray-300 dark:border-line text-accent shadow-xs focus:ring-accent"
                            />
                            <div className="text-xs">
                                <span className="font-semibold text-gray-900 dark:text-white">Required for completion</span>
                                <p className="text-[0.625rem] text-gray-400">Must be finished to complete lesson</p>
                            </div>
                        </label>

                        <label className="flex items-center gap-2.5 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={!!data.is_published}
                                onChange={(e) => setData('is_published', e.target.checked)}
                                className="rounded border-gray-300 dark:border-line text-accent shadow-xs focus:ring-accent"
                            />
                            <div className="text-xs">
                                <span className="font-semibold text-gray-900 dark:text-white">Publish stage immediately</span>
                                <p className="text-[0.625rem] text-gray-400">Visible to learners right away</p>
                            </div>
                        </label>
                    </div>
                </div>{/* end scrollable body */}

                {/* Sticky footer */}
                <div className="flex justify-end gap-2 px-6 py-4 border-t border-line shrink-0">
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
                        {processing ? 'Saving...' : isEdit ? 'Update Stage' : 'Create Stage'}
                    </button>
                </div>
                </form>
            </div>
        </Modal>
    );
}

