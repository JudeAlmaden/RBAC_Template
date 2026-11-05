import React from 'react';
import { Link, router } from '@inertiajs/react';
import { BookOpen, Plus, Clock, FileText, Layers, Pencil, Trash2 } from 'lucide-react';
import ActionDropdown from '@/Components/ActionDropdown';

export default function ModuleTopicList({
    module,
    currentIndex = 0,
    onAddLesson,
    onEditTopic,
    onDeleteTopic,
}) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                        Lessons inside this Module ({module.topics?.length || 0})
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Each lesson contains pedagogical stages (Activate, Encode, Retrieve, Lab, Assessment).
                    </p>
                </div>
            </div>

            {(!module.topics || module.topics.length === 0) ? (
                <div className="bg-white dark:bg-[#15151A] rounded-xl border border-[#E8E8EC] dark:border-[#26262D] p-12 text-center">
                    <BookOpen className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">No lessons yet</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto mt-1">
                        Create your first lesson to start building content for this module.
                    </p>
                    <button
                        onClick={onAddLesson}
                        className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-[#4A91CC] hover:bg-[#347DBB] shadow-xs transition"
                    >
                        <Plus className="w-4 h-4" />
                        Add First Lesson
                    </button>
                </div>
            ) : (
                <div className="space-y-2.5">
                    {module.topics.map((t, tIdx) => (
                        <div
                            key={t.id}
                            onClick={() => router.visit(route('topics.stages.index', t.id))}
                            className="group/topic bg-white dark:bg-[#15151A] rounded-xl border border-[#E8E8EC] dark:border-[#26262D] p-3.5 shadow-xs hover:border-[#4A91CC]/40 hover:bg-gray-50/70 dark:hover:bg-[#1C1C24]/70 transition cursor-pointer"
                        >
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3.5 min-w-0">
                                    <div className="w-7 h-7 rounded-md bg-gray-100 dark:bg-[#26262D] flex items-center justify-center text-gray-500 dark:text-gray-400 shrink-0 group-hover/topic:text-[#4A91CC] transition">
                                        <BookOpen className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-xs text-gray-900 dark:text-white group-hover/topic:text-[#4A91CC] transition truncate">
                                                {currentIndex + 1}.{tIdx + 1} {t.title}
                                            </span>
                                            <span
                                                className={`inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-semibold ${
                                                    t.is_published
                                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                                }`}
                                            >
                                                {t.is_published ? 'Published' : 'Draft'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 text-[10px] text-gray-400 mt-0.5">
                                            {t.estimated_minutes && (
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {t.estimated_minutes} min
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1">
                                                <FileText className="w-3 h-3" />
                                                {t.sections_count || 0} stages
                                            </span>
                                            {t.description && (
                                                <span className="truncate max-w-md hidden sm:inline">
                                                    — {t.description}
                                                </span>
                                            )}
                                        </div>

                                        {/* Stage chips */}
                                        {t.sections && t.sections.length > 0 && (
                                            <div className="flex flex-wrap items-center gap-1 mt-1.5">
                                                {t.sections.map((sec) => (
                                                    <span
                                                        key={sec.id}
                                                        className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-semibold uppercase tracking-wider bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200/50 dark:border-purple-800/40"
                                                    >
                                                        {sec.section_type}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Actions Toolbar matching Course view */}
                                <div
                                    className="flex items-center gap-1.5 shrink-0"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <Link
                                        href={route('topics.stages.index', t.id)}
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-[#4A91CC] bg-[#4A91CC]/10 hover:bg-[#4A91CC]/20 transition"
                                        title="Open Pedagogical Stage Builder"
                                    >
                                        <Layers className="w-3.5 h-3.5" />
                                        Stages ({t.sections_count || 0})
                                    </Link>
                                    <ActionDropdown align="right" widthClass="w-36">
                                        <button
                                            onClick={() => onEditTopic(t)}
                                            className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#26262D] transition"
                                        >
                                            <Pencil className="w-3.5 h-3.5 text-gray-400" />
                                            Edit Lesson
                                        </button>
                                        <button
                                            onClick={() => onDeleteTopic(t)}
                                            className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition"
                                        >
                                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                            Delete Lesson
                                        </button>
                                    </ActionDropdown>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
