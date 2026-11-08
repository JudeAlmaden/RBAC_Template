import React from 'react';
import { Link, router } from '@inertiajs/react';
import {
    GraduationCap,
    GitFork,
    Calendar,
    Clock,
    CheckCircle2,
    BookOpen,
    Trash2,
    CalendarDays,
} from 'lucide-react';

const ENROLLMENT_STATUS_BADGE = {
    enrolled:    'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800/40',
    in_progress: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800/40',
    completed:   'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40',
    dropped:     'bg-gray-100 text-gray-600 dark:bg-raised dark:text-gray-400 border-gray-200 dark:border-line',
};

export default function UserAssignedCourses({ profileUser, assignedCourses = [] }) {
    const handleUnassign = (courseId, courseTitle) => {
        if (confirm(`Remove enrollment for "${courseTitle}" from ${profileUser.name}?`)) {
            router.delete(route('courses.unassign', { course: courseId, user: profileUser.id }), {
                preserveScroll: true,
            });
        }
    };

    return (
        <div className="bg-surface rounded-xl border border-line shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-line">
                <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-accent" />
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                        Assigned Courses &amp; Learning Progress
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[0.625rem] font-bold bg-accent/10 text-accent dark:bg-accent/20 dark:text-accent-light">
                        {assignedCourses.length}
                    </span>
                </div>

                <Link
                    href={route('courses.index')}
                    className="text-xs font-semibold text-accent-light hover:underline"
                >
                    Manage All Courses →
                </Link>
            </div>

            {assignedCourses.length === 0 ? (
                <div className="py-8 text-center">
                    <GraduationCap className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        No courses assigned to this user yet.
                    </p>
                    <p className="text-[0.6875rem] text-gray-400 dark:text-gray-500 mt-0.5">
                        Assign courses from the Courses page or through learning tracks.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {assignedCourses.map((item) => (
                        <div
                            key={item.id}
                            className="p-4 rounded-xl border border-line bg-raised dark:bg-sunken flex flex-col justify-between gap-3 hover:border-accent/40 transition"
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-xs text-gray-900 dark:text-white truncate">
                                            {item.course_title}
                                        </span>
                                        {item.required && (
                                            <span className="text-[0.5625rem] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40">
                                                Required
                                            </span>
                                        )}
                                    </div>
                                    {item.course_description && (
                                        <p className="text-[0.6875rem] text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                                            {item.course_description}
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[0.625rem] font-semibold border ${ENROLLMENT_STATUS_BADGE[item.status] ?? ENROLLMENT_STATUS_BADGE.enrolled}`}>
                                        {item.status.replace('_', ' ')}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => handleUnassign(item.course_id, item.course_title)}
                                        title="Remove user from course"
                                        className="p-1 text-gray-400 hover:text-red-500 rounded transition"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>

                            {/* Prerequisites Pill List (if any) */}
                            {item.prerequisites && item.prerequisites.length > 0 && (
                                <div className="space-y-1">
                                    <span className="text-[0.625rem] font-semibold text-gray-400 uppercase tracking-wider">
                                        Prerequisites ({item.prerequisites.length}):
                                    </span>
                                    <div className="flex flex-wrap gap-1">
                                        {item.prerequisites.map((p) => (
                                            <span
                                                key={p.id}
                                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-[0.625rem]"
                                            >
                                                <GitFork className="w-2.5 h-2.5" />
                                                <span className="truncate max-w-[130px]">{p.title}</span>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Progress bar */}
                            <div>
                                <div className="flex items-center justify-between text-[0.625rem] text-gray-400 mb-1">
                                    <span>Progress</span>
                                    <span className="font-semibold text-gray-700 dark:text-gray-200">
                                        {item.progress_percent}%
                                    </span>
                                </div>
                                <div className="w-full h-1.5 bg-gray-200 dark:bg-raised rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-accent rounded-full transition-all"
                                        style={{ width: `${item.progress_percent}%` }}
                                    />
                                </div>
                            </div>

                            {/* Meta footer */}
                            <div className="flex items-center justify-between text-[0.625rem] text-gray-400 border-t border-line pt-2">
                                <span className="flex items-center gap-1">
                                    <BookOpen className="w-3 h-3" />
                                    Enrolled: {item.enrolled_at || '—'}
                                </span>
                                {item.due_at && (
                                    <span className="flex items-center gap-1 text-amber-500">
                                        <CalendarDays className="w-3 h-3" />
                                        Due: {item.due_at}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

