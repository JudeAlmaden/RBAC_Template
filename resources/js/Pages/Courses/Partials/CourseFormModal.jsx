import React from 'react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { BookOpen, AlertCircle, Check } from 'lucide-react';

const STATUS_OPTIONS = [
    { value: 'draft', label: 'Draft', description: 'Not visible to learners' },
    { value: 'published', label: 'Published', description: 'Visible and accessible' },
    { value: 'archived', label: 'Archived', description: 'Hidden from learners' },
];

export default function CourseFormModal({ show, onClose, form, onSubmit, mode = 'create', allCourses = [], editingCourse = null }) {
    const isEdit = mode === 'edit';

    // Filter out the course itself from selectable prerequisites
    const availablePrereqs = allCourses.filter((c) => !editingCourse || c.id !== editingCourse.id);

    const togglePrereq = (id) => {
        const current = form.data.prerequisite_ids || [];
        if (current.includes(id)) {
            form.setData('prerequisite_ids', current.filter((x) => x !== id));
        } else {
            form.setData('prerequisite_ids', [...current, id]);
        }
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="lg">
            <form onSubmit={onSubmit} className="p-6">
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                    {isEdit ? 'Edit Course' : 'Create New Course'}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
                    {isEdit ? 'Update the course details, status, and prerequisites.' : 'Fill in the details to create a new course.'}
                </p>

                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                    <div>
                        <InputLabel htmlFor="course-title" value="Course Title" />
                        <TextInput
                            id="course-title"
                            value={form.data.title}
                            onChange={(e) => form.setData('title', e.target.value)}
                            className="mt-1 block w-full text-xs"
                            placeholder="e.g. Introduction to Cybersecurity"
                            required
                        />
                        <InputError message={form.errors.title} className="mt-1" />
                    </div>

                    <div>
                        <InputLabel htmlFor="course-description" value="Description" />
                        <textarea
                            id="course-description"
                            value={form.data.description}
                            onChange={(e) => form.setData('description', e.target.value)}
                            rows={3}
                            placeholder="Brief overview of what this course covers..."
                            className="mt-1 block w-full text-xs rounded-lg border border-line bg-surface text-gray-900 dark:text-gray-100 px-3 py-2 focus:ring-2 focus:ring-accent focus:outline-none resize-none transition"
                        />
                        <InputError message={form.errors.description} className="mt-1" />
                    </div>

                    <div>
                        <InputLabel value="Status" />
                        <div className="mt-1 grid grid-cols-3 gap-2">
                            {STATUS_OPTIONS.map((opt) => {
                                const isSelected = form.data.status === opt.value;
                                return (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => form.setData('status', opt.value)}
                                        className={`flex flex-col items-start p-2.5 rounded-lg border text-xs transition select-none ${
                                            isSelected
                                                ? 'border-accent bg-accent/5 dark:bg-accent/10'
                                                : 'border-line bg-surface hover:border-gray-300 dark:hover:border-gray-600'
                                        }`}
                                    >
                                        <span className={`font-semibold ${isSelected ? 'text-accent-light' : 'text-gray-700 dark:text-gray-300'}`}>
                                            {opt.label}
                                        </span>
                                        <span className="text-[0.625rem] text-gray-400 mt-0.5">{opt.description}</span>
                                    </button>
                                );
                            })}
                        </div>
                        <InputError message={form.errors.status} className="mt-1" />
                    </div>

                    {/* Prerequisites Section */}
                    <div className="pt-2 border-t border-line">
                        <div className="flex items-center justify-between mb-1.5">
                            <InputLabel value="Prerequisite Courses (Optional)" />
                            <span className="text-[0.6875rem] text-gray-400">
                                {(form.data.prerequisite_ids || []).length} selected
                            </span>
                        </div>
                        <p className="text-[0.6875rem] text-gray-500 dark:text-gray-400 mb-2.5">
                            Specify any courses learners should complete before or alongside this course.
                        </p>

                        {availablePrereqs.length === 0 ? (
                            <div className="p-3 text-xs text-center text-gray-400 rounded-lg border border-dashed border-line">
                                No other courses available to set as prerequisites.
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <div className="max-h-40 overflow-y-auto space-y-1.5 p-2 rounded-lg border border-line bg-raised dark:bg-sunken">
                                    {availablePrereqs.map((c) => {
                                        const isSelected = (form.data.prerequisite_ids || []).includes(c.id);
                                        return (
                                            <div
                                                key={c.id}
                                                onClick={() => togglePrereq(c.id)}
                                                className={`flex items-center justify-between p-2 rounded-md border text-xs cursor-pointer transition select-none ${
                                                    isSelected
                                                        ? 'bg-surface dark:bg-raised border-accent text-accent-light'
                                                        : 'bg-white/60 dark:bg-raised/60 border-line text-gray-700 dark:text-gray-300 hover:border-gray-300'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <div
                                                        className={`w-4 h-4 rounded flex items-center justify-center border transition shrink-0 ${
                                                            isSelected
                                                                ? 'bg-accent border-accent text-white'
                                                                : 'border-gray-300 dark:border-line bg-surface'
                                                        }`}
                                                    >
                                                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                                    </div>
                                                    <span className="truncate font-medium">{c.title}</span>
                                                </div>
                                                <span className="text-[0.625rem] px-1.5 py-0.5 rounded uppercase font-semibold text-gray-400 dark:text-gray-500">
                                                    {c.status}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>

                                {(form.data.prerequisite_ids || []).length > 0 && (
                                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30">
                                        <input
                                            type="checkbox"
                                            checked={form.data.auto_enroll_prerequisites}
                                            onChange={(e) => form.setData('auto_enroll_prerequisites', e.target.checked)}
                                            className="w-4 h-4 rounded border-gray-300 dark:border-line text-accent focus:ring-accent"
                                        />
                                        <div className="text-xs">
                                            <span className="font-semibold text-gray-900 dark:text-white">Auto-add prerequisites</span>
                                            <p className="text-[0.625rem] text-gray-500 dark:text-gray-400">
                                                Automatically enroll the user into selected prerequisite courses when this course is assigned.
                                            </p>
                                        </div>
                                    </label>
                                )}
                            </div>
                        )}
                        <InputError message={form.errors.prerequisite_ids} className="mt-1" />
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-2.5">
                    <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
                    <PrimaryButton
                        disabled={form.processing}
                        className="!bg-accent hover:!bg-accent-hover"
                    >
                        {isEdit ? 'Save Changes' : 'Create Course'}
                    </PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}
