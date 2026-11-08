import React from 'react';
import { GraduationCap, GitFork, UserPlus, Pencil, Trash2 } from 'lucide-react';
import ActionDropdown from '@/Components/ActionDropdown';

const STATUS_BADGE = {
    draft: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    published: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    archived: 'bg-gray-100 text-gray-700 dark:bg-raised dark:text-gray-400',
};

export default function CourseHeroCard({
    course,
    totalTopics = 0,
    onAssignLearner,
    onEditCourse,
    onDeleteCourse,
}) {
    return (
        <div className="bg-surface rounded-xl border border-line p-6 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-accent/10 dark:bg-accent/20 flex items-center justify-center shrink-0">
                        <GraduationCap className="w-7 h-7 text-accent-light" />
                    </div>
                    <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2.5">
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                                {course.title}
                            </h1>
                            <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[0.625rem] font-semibold capitalize ${
                                    STATUS_BADGE[course.status] || STATUS_BADGE.draft
                                }`}
                            >
                                {course.status}
                            </span>
                        </div>
                        {course.description ? (
                            <p className="text-xs text-gray-600 dark:text-gray-400 max-w-3xl leading-relaxed">
                                {course.description}
                            </p>
                        ) : (
                            <p className="text-xs italic text-gray-400 dark:text-gray-500">
                                No description provided for this course.
                            </p>
                        )}

                        {/* Meta tags */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-2 text-[0.6875rem] text-gray-500 dark:text-gray-400">
                            <div>
                                Slug: <code className="text-accent-light font-mono">{course.slug}</code>
                            </div>
                            <span>•</span>
                            <div>
                                Created: <span className="font-medium text-gray-700 dark:text-gray-300">{course.created_at}</span>
                                {course.created_by && ` by ${course.created_by.name}`}
                            </div>
                            {course.published_at && (
                                <>
                                    <span>•</span>
                                    <div>
                                        Published: <span className="font-medium text-emerald-600 dark:text-emerald-400">{course.published_at}</span>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Prerequisites pills */}
                        {course.prerequisites && course.prerequisites.length > 0 && (
                            <div className="pt-2 flex flex-wrap items-center gap-1.5">
                                <span className="text-[0.6875rem] font-medium text-gray-400 flex items-center gap-1">
                                    <GitFork className="w-3 h-3" /> Prerequisites:
                                </span>
                                {course.prerequisites.map((p) => (
                                    <span
                                        key={p.id}
                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40 text-[0.625rem] font-medium"
                                    >
                                        {p.title}
                                        {p.auto_enroll && (
                                            <span className="text-[0.5625rem] font-bold text-indigo-500 dark:text-indigo-400">
                                                [Auto]
                                            </span>
                                        )}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Top Action Buttons */}
                <div className="flex items-center gap-1.5 self-start shrink-0">
                    <button
                        onClick={onAssignLearner}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-accent hover:bg-accent-hover shadow-2xs transition"
                    >
                        <UserPlus className="w-3.5 h-3.5" />
                        Assign Learner
                    </button>
                    <ActionDropdown align="right" widthClass="w-36">
                        <button
                            onClick={onEditCourse}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-gray-700 dark:text-gray-200 hover:bg-raised dark:hover:bg-raised transition"
                        >
                            <Pencil className="w-3.5 h-3.5 text-gray-400" />
                            Edit Course
                        </button>
                        <button
                            onClick={onDeleteCourse}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition"
                        >
                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                            Delete Course
                        </button>
                    </ActionDropdown>
                </div>
            </div>

            {/* Stats summary strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-line">
                <div className="p-3 rounded-lg bg-raised border border-line/80 dark:border-line">
                    <div className="text-[0.625rem] uppercase font-bold text-gray-400 tracking-wider">Modules</div>
                    <div className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
                        {course.modules ? course.modules.length : 0}
                    </div>
                </div>
                <div className="p-3 rounded-lg bg-raised border border-line/80 dark:border-line">
                    <div className="text-[0.625rem] uppercase font-bold text-gray-400 tracking-wider">Lessons / Topics</div>
                    <div className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
                        {totalTopics}
                    </div>
                </div>
                <div className="p-3 rounded-lg bg-raised border border-line/80 dark:border-line">
                    <div className="text-[0.625rem] uppercase font-bold text-gray-400 tracking-wider">Enrolled Learners</div>
                    <div className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
                        {course.enrollments ? course.enrollments.length : 0}
                    </div>
                </div>
                <div className="p-3 rounded-lg bg-raised border border-line/80 dark:border-line">
                    <div className="text-[0.625rem] uppercase font-bold text-gray-400 tracking-wider">Prerequisites</div>
                    <div className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
                        {course.prerequisites ? course.prerequisites.length : 0}
                    </div>
                </div>
            </div>
        </div>
    );
}

