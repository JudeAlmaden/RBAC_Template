import React from 'react';
import { Link } from '@inertiajs/react';
import { Plus, Pencil, Trash2, Folder, Layers, Clock } from 'lucide-react';
import ActionDropdown from '@/Components/ActionDropdown';

export default function ModuleHeroCard({
    module,
    course,
    currentIndex = 0,
    onAddLesson,
    onEditModule,
    onDeleteModule,
}) {
    const topicsCount = module.topics?.length || 0;
    const totalStages = (module.topics || []).reduce(
        (acc, t) => acc + (t.sections_count || (t.sections ? t.sections.length : 0)),
        0
    );
    const totalMinutes = (module.topics || []).reduce(
        (acc, t) => acc + (parseInt(t.estimated_minutes, 10) || 0),
        0
    );

    return (
        <div className="bg-white dark:bg-[#15151A] rounded-xl border border-[#E8E8EC] dark:border-[#26262D] p-6 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-[#4A91CC]/10 dark:bg-[#4A91CC]/20 flex items-center justify-center shrink-0">
                        <Folder className="w-7 h-7 text-[#4A91CC] dark:text-[#6BA3D6]" />
                    </div>
                    <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2.5">
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                                {module.title}
                            </h1>
                            <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                                    module.is_published
                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                }`}
                            >
                                {module.is_published ? 'Published' : 'Draft'}
                            </span>
                        </div>
                        {module.description ? (
                            <p className="text-xs text-gray-600 dark:text-gray-400 max-w-3xl leading-relaxed">
                                {module.description}
                            </p>
                        ) : (
                            <p className="text-xs italic text-gray-400 dark:text-gray-500">
                                No description provided for this module.
                            </p>
                        )}

                        {/* Meta tags */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-2 text-[11px] text-gray-500 dark:text-gray-400">
                            <div>
                                Part of course:{' '}
                                <Link
                                    href={route('courses.show', course.id)}
                                    className="font-medium text-[#4A91CC] hover:underline"
                                >
                                    {course.title}
                                </Link>
                            </div>
                            <span>•</span>
                            <div>
                                Module Sequence:{' '}
                                <span className="font-medium text-gray-700 dark:text-gray-300">
                                    #{currentIndex + 1}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top Action Toolbar */}
                <div className="flex items-center gap-1.5 self-start shrink-0">
                    <button
                        onClick={onAddLesson}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#4A91CC] hover:bg-[#347DBB] shadow-2xs transition"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Add Lesson
                    </button>
                    <ActionDropdown align="right" widthClass="w-36">
                        <button
                            onClick={onEditModule}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#26262D] transition"
                        >
                            <Pencil className="w-3.5 h-3.5 text-gray-400" />
                            Edit Module
                        </button>
                        <button
                            onClick={onDeleteModule}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition"
                        >
                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                            Delete Module
                        </button>
                    </ActionDropdown>
                </div>
            </div>

            {/* Stats summary strip (identical layout to Course view) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-[#E8E8EC] dark:border-[#26262D]">
                <div className="p-3 rounded-lg bg-[#FAFAFC] dark:bg-[#1C1C24] border border-[#E8E8EC]/80 dark:border-[#26262D]">
                    <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Lessons / Topics</div>
                    <div className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
                        {topicsCount}
                    </div>
                </div>
                <div className="p-3 rounded-lg bg-[#FAFAFC] dark:bg-[#1C1C24] border border-[#E8E8EC]/80 dark:border-[#26262D]">
                    <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Total Stages</div>
                    <div className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
                        {totalStages}
                    </div>
                </div>
                <div className="p-3 rounded-lg bg-[#FAFAFC] dark:bg-[#1C1C24] border border-[#E8E8EC]/80 dark:border-[#26262D]">
                    <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Est. Duration</div>
                    <div className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
                        {totalMinutes ? `${totalMinutes}m` : '—'}
                    </div>
                </div>
                <div className="p-3 rounded-lg bg-[#FAFAFC] dark:bg-[#1C1C24] border border-[#E8E8EC]/80 dark:border-[#26262D]">
                    <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Course Status</div>
                    <div className="text-base font-bold text-gray-900 dark:text-white mt-1 capitalize">
                        {course.status || 'Active'}
                    </div>
                </div>
            </div>
        </div>
    );
}
