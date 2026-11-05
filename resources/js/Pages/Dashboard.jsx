import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { GraduationCap, BookOpen, CheckCircle2, Clock, CalendarDays } from 'lucide-react';

const ENROLLMENT_STATUS_BADGE = {
    enrolled:    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    in_progress: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    completed:   'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    dropped:     'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
};

const ENROLLMENT_STATUS_LABEL = {
    enrolled:    'Enrolled',
    in_progress: 'In Progress',
    completed:   'Completed',
    dropped:     'Dropped',
};

function CourseCard({ enrollment }) {
    const statusClass = ENROLLMENT_STATUS_BADGE[enrollment.status] ?? ENROLLMENT_STATUS_BADGE.enrolled;
    const statusLabel = ENROLLMENT_STATUS_LABEL[enrollment.status] ?? enrollment.status;

    return (
        <div className="bg-white dark:bg-[#15151A] rounded-xl border border-[#E8E8EC] dark:border-[#26262D] p-4 shadow-xs flex flex-col gap-3 hover:border-[#5B5FC7]/40 transition-colors">
            <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#5B5FC7]/10 dark:bg-[#5B5FC7]/20 flex items-center justify-center shrink-0">
                    <GraduationCap className="w-4 h-4 text-[#5B5FC7] dark:text-[#8A8DE2]" />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white leading-snug truncate">
                        {enrollment.course_title}
                    </div>
                    {enrollment.course_description && (
                        <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">
                            {enrollment.course_description}
                        </p>
                    )}
                </div>
                <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusClass}`}>
                    {statusLabel}
                </span>
            </div>

            {/* Progress bar */}
            <div>
                <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-gray-400">Progress</span>
                    <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-300">{enrollment.progress_percent}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 dark:bg-[#26262D] rounded-full overflow-hidden">
                    <div
                        className="h-full bg-[#5B5FC7] rounded-full transition-all"
                        style={{ width: `${enrollment.progress_percent}%` }}
                    />
                </div>
            </div>

            <div className="flex items-center gap-4 text-[10px] text-gray-400 border-t border-[#E8E8EC] dark:border-[#26262D] pt-2">
                <span className="flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    Enrolled {enrollment.enrolled_at}
                </span>
                {enrollment.due_at && (
                    <span className="flex items-center gap-1 text-amber-500">
                        <CalendarDays className="w-3 h-3" />
                        Due {enrollment.due_at}
                    </span>
                )}
            </div>
        </div>
    );
}

function MyCourses({ enrollments }) {
    const total      = enrollments.length;
    const completed  = enrollments.filter((e) => e.status === 'completed').length;
    const inProgress = enrollments.filter((e) => e.status === 'in_progress').length;

    return (
        <div className="space-y-5">
            {/* Summary strip */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: 'Assigned', value: total, icon: GraduationCap, color: 'text-[#5B5FC7]', bg: 'bg-[#5B5FC7]/10 dark:bg-[#5B5FC7]/20' },
                    { label: 'In Progress', value: inProgress, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/20' },
                    { label: 'Completed', value: completed, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/20' },
                ].map(({ label, value, icon: Icon, color, bg }) => (
                    <div key={label} className="bg-white dark:bg-[#15151A] rounded-xl border border-[#E8E8EC] dark:border-[#26262D] p-4 shadow-xs flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                            <Icon className={`w-4 h-4 ${color}`} />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-gray-900 dark:text-white leading-none">{value}</div>
                            <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">{label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Course cards */}
            {enrollments.length === 0 ? (
                <div className="bg-white dark:bg-[#15151A] rounded-xl border border-[#E8E8EC] dark:border-[#26262D] p-10 text-center shadow-xs">
                    <GraduationCap className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No courses assigned yet</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Your assigned courses will appear here.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {enrollments.map((enrollment) => (
                        <CourseCard key={enrollment.id} enrollment={enrollment} />
                    ))}
                </div>
            )}
        </div>
    );
}

function AdminSkeleton() {
    return (
        <div className="space-y-6">
            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white dark:bg-[#15151A] rounded-xl border border-[#E8E8EC] dark:border-[#26262D] p-5 shadow-xs">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-9 h-9 rounded-xl bg-gray-200 dark:bg-[#22222C] animate-pulse" />
                            <div className="w-14 h-4 rounded-full bg-gray-100 dark:bg-[#1C1C24] animate-pulse" />
                        </div>
                        <div className="space-y-2">
                            <div className="h-6 w-20 rounded-md bg-gray-200 dark:bg-[#22222C] animate-pulse" />
                            <div className="h-3 w-28 rounded bg-gray-100 dark:bg-[#1C1C24] animate-pulse" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Chart + Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-[#15151A] rounded-xl border border-[#E8E8EC] dark:border-[#26262D] p-5 shadow-xs">
                    <div className="flex items-center justify-between mb-6">
                        <div className="space-y-1.5">
                            <div className="h-4 w-40 rounded bg-gray-200 dark:bg-[#22222C] animate-pulse" />
                            <div className="h-2.5 w-56 rounded bg-gray-100 dark:bg-[#1C1C24] animate-pulse" />
                        </div>
                    </div>
                    <div className="h-52 flex items-end justify-between gap-2 pt-6 px-2 border-b border-[#E8E8EC] dark:border-[#26262D]">
                        {[35, 60, 45, 80, 65, 40, 90, 75, 50, 85, 95, 70].map((height, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                                <div
                                    style={{ height: `${height}%` }}
                                    className="w-full max-w-[28px] rounded-t-md bg-gray-100 dark:bg-[#1F1F28] animate-pulse"
                                />
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between pt-3 text-[10px] text-gray-400">
                        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m) => (
                            <span key={m} className="w-6 text-center">{m}</span>
                        ))}
                    </div>
                </div>

                <div className="bg-white dark:bg-[#15151A] rounded-xl border border-[#E8E8EC] dark:border-[#26262D] p-5 shadow-xs">
                    <div className="h-4 w-32 rounded bg-gray-200 dark:bg-[#22222C] animate-pulse mb-5" />
                    <div className="space-y-4">
                        {[1, 2, 3, 4].map((item) => (
                            <div key={item} className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-[#22222C] animate-pulse shrink-0" />
                                <div className="min-w-0 flex-1 space-y-1.5">
                                    <div className="h-3 w-3/4 rounded bg-gray-200 dark:bg-[#22222C] animate-pulse" />
                                    <div className="h-2.5 w-1/2 rounded bg-gray-100 dark:bg-[#1C1C24] animate-pulse" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Dashboard({ enrollments = null }) {
    const isLearnerView = enrollments !== null;

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h1 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                        Dashboard
                    </h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        {isLearnerView
                            ? 'Your assigned courses and learning progress'
                            : 'System performance, user access statistics, and live activity metrics'}
                    </p>
                </div>
            }
        >
            <Head title="Dashboard" />

            {isLearnerView ? (
                <MyCourses enrollments={enrollments} />
            ) : (
                <AdminSkeleton />
            )}
        </AuthenticatedLayout>
    );
}
