import React from 'react';
import { router } from '@inertiajs/react';
import { Users, Calendar, Trash2 } from 'lucide-react';

export default function CourseLearnersTab({
    course,
    onAssignLearner,
}) {
    const handleUnassign = (enr) => {
        if (!enr.user) return;
        if (confirm(`Remove ${enr.user.name} from this course?`)) {
            router.delete(route('courses.unassign', [course.id, enr.user.id]));
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                        Enrolled Learners ({course.enrollments?.length || 0})
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Track student progress, due dates, and enrollment statuses.
                    </p>
                </div>
                <button
                    onClick={onAssignLearner}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-accent hover:bg-accent-hover shadow-2xs transition"
                >
                    Assign Learner
                </button>
            </div>

            <div className="bg-surface rounded-xl border border-line overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                    <thead>
                        <tr className="border-b border-line bg-raised">
                            <th className="py-3 px-5 font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[0.625rem]">
                                Learner
                            </th>
                            <th className="py-3 px-5 font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[0.625rem]">
                                Status
                            </th>
                            <th className="py-3 px-5 font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[0.625rem]">
                                Progress
                            </th>
                            <th className="py-3 px-5 font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[0.625rem]">
                                Enrolled Date
                            </th>
                            <th className="py-3 px-5 font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[0.625rem]">
                                Due Date
                            </th>
                            <th className="py-3 px-5 text-center font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[0.625rem]">
                                Action
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                        {(!course.enrollments || course.enrollments.length === 0) ? (
                            <tr>
                                <td colSpan={6} className="py-12 text-center text-gray-400">
                                    <Users className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                                    <p className="text-xs font-medium">No learners enrolled yet.</p>
                                    <button
                                        onClick={onAssignLearner}
                                        className="mt-2 text-xs font-semibold text-accent hover:underline"
                                    >
                                        Assign a learner now
                                    </button>
                                </td>
                            </tr>
                        ) : (
                            course.enrollments.map((enr) => (
                                <tr
                                    key={enr.id}
                                    onClick={() => enr.user && router.visit(route('users.show', enr.user.id))}
                                    className="group hover:bg-raised transition cursor-pointer"
                                >
                                    <td className="py-2.5 px-5">
                                        <div className="font-semibold text-gray-900 dark:text-white text-xs group-hover:text-accent transition">
                                            {enr.user?.name || 'Unknown User'}
                                        </div>
                                        <div className="text-[0.625rem] text-gray-400">
                                            {enr.user?.email}
                                        </div>
                                    </td>
                                    <td className="py-2.5 px-5">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[0.625rem] font-semibold capitalize bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                            {enr.status}
                                        </span>
                                    </td>
                                    <td className="py-2.5 px-5">
                                        <div className="flex items-center gap-2 max-w-[140px]">
                                            <div className="flex-1 bg-gray-200 dark:bg-raised h-1.5 rounded-full overflow-hidden">
                                                <div
                                                    className="bg-accent h-full rounded-full"
                                                    style={{ width: `${Math.min(enr.progress_percent || 0, 100)}%` }}
                                                />
                                            </div>
                                            <span className="text-[0.625rem] font-semibold text-gray-700 dark:text-gray-300">
                                                {Math.round(enr.progress_percent || 0)}%
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-2.5 px-5 text-gray-500 dark:text-gray-400 text-[0.6875rem]">
                                        {enr.enrolled_at || '—'}
                                    </td>
                                    <td className="py-2.5 px-5 text-gray-500 dark:text-gray-400 text-[0.6875rem]">
                                        {enr.due_at ? (
                                            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                                                <Calendar className="w-3 h-3" />
                                                {enr.due_at}
                                            </span>
                                        ) : (
                                            '—'
                                        )}
                                    </td>
                                    <td
                                        className="py-2.5 px-5 text-center"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {enr.user && (
                                            <button
                                                onClick={() => handleUnassign(enr)}
                                                className="w-7 h-7 rounded-md inline-flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition"
                                                title="Unassign Learner"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

