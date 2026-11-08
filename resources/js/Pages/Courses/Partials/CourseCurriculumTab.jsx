import React from 'react';
import { Link, router } from '@inertiajs/react';
import {
    Folder,
    FolderPlus,
    Layers,
    Plus,
    ChevronDown,
    ChevronRight,
    Pencil,
    Trash2,
    BookOpen,
    Clock,
    FileText,
} from 'lucide-react';
import ActionDropdown from '@/Components/ActionDropdown';

export default function CourseCurriculumTab({
    course,
    expandedModules,
    toggleModuleExpand,
    onAddModule,
    onEditModule,
    onDeleteModule,
    onAddTopic,
    onEditTopic,
    onDeleteTopic,
}) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                        Modules & Topics
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Organize lessons, labs, and assessments inside structured modules.
                    </p>
                </div>
                <button
                    onClick={onAddModule}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-accent hover:bg-accent-hover shadow-xs transition"
                >
                    <FolderPlus className="w-4 h-4" />
                    Add Module
                </button>
            </div>

            {(!course.modules || course.modules.length === 0) ? (
                <div className="bg-surface rounded-xl border border-line p-12 text-center">
                    <Layers className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">No modules added yet</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto mt-1">
                        Start building the course curriculum by adding your first module.
                    </p>
                    <button
                        onClick={onAddModule}
                        className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-accent hover:bg-accent-hover shadow-xs transition"
                    >
                        <Plus className="w-4 h-4" />
                        Create First Module
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {course.modules.map((m, mIdx) => {
                        const isExpanded = !!expandedModules[m.id];
                        return (
                            <div
                                key={m.id}
                                className="bg-surface rounded-xl border border-line shadow-xs overflow-hidden transition"
                            >
                                {/* Module Header Strip */}
                                <div
                                    onClick={() => router.visit(route('courses.modules.show', [course.id, m.id]))}
                                    className="group/module flex items-center justify-between p-4 bg-raised border-b border-line cursor-pointer hover:bg-raised/70 dark:hover:bg-raised transition"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleModuleExpand(m.id);
                                            }}
                                            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-raised text-gray-500 dark:text-gray-400 transition"
                                        >
                                            {isExpanded ? (
                                                <ChevronDown className="w-4 h-4" />
                                            ) : (
                                                <ChevronRight className="w-4 h-4" />
                                            )}
                                        </button>
                                        <div className="w-6 h-6 rounded bg-accent/10 dark:bg-accent/20 flex items-center justify-center shrink-0">
                                            <Folder className="w-3.5 h-3.5 text-accent" />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-xs text-gray-900 dark:text-white group-hover/module:text-accent transition truncate">
                                                    {m.title}
                                                </span>
                                                <span
                                                    className={`inline-flex items-center px-1.5 py-0.2 rounded text-[0.5625rem] font-semibold ${
                                                        m.is_published
                                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                                    }`}
                                                >
                                                    {m.is_published ? 'Published' : 'Draft'}
                                                </span>
                                            </div>
                                            {m.description && (
                                                <p className="text-[0.6875rem] text-gray-500 dark:text-gray-400 truncate max-w-xl mt-0.5">
                                                    {m.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div
                                        className="flex items-center gap-1 shrink-0"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {/* Quick Add Lesson icon button */}
                                        <button
                                            onClick={() => onAddTopic(m)}
                                            className="w-7 h-7 rounded-md flex items-center justify-center text-gray-500 hover:text-accent hover:bg-accent/10 dark:text-gray-400 dark:hover:text-accent transition"
                                            title="Add Lesson to this module"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                        
                                        {/* Dropdown Menu for secondary module actions */}
                                        <ActionDropdown align="right" widthClass="w-36">
                                            <button
                                                onClick={() => onAddTopic(m)}
                                                className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-gray-700 dark:text-gray-200 hover:bg-raised dark:hover:bg-raised transition font-medium"
                                            >
                                                <Plus className="w-3.5 h-3.5 text-accent" />
                                                Add Lesson
                                            </button>
                                            <button
                                                onClick={() => onEditModule(m)}
                                                className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-gray-700 dark:text-gray-200 hover:bg-raised dark:hover:bg-raised transition"
                                            >
                                                <Pencil className="w-3.5 h-3.5 text-gray-400" />
                                                Edit Module
                                            </button>
                                            <button
                                                onClick={() => onDeleteModule(m)}
                                                className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition"
                                            >
                                                <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                                Delete Module
                                            </button>
                                        </ActionDropdown>
                                    </div>
                                </div>

                                {/* Topics List */}
                                {isExpanded && (
                                    <div className="p-4 space-y-2">
                                        {(!m.topics || m.topics.length === 0) ? (
                                            <div className="py-6 text-center border border-dashed border-line rounded-lg">
                                                <p className="text-xs text-gray-400">No lessons inside this module yet.</p>
                                                <button
                                                    onClick={() => onAddTopic(m)}
                                                    className="mt-2 text-xs font-semibold text-accent hover:underline"
                                                >
                                                    + Add first lesson
                                                </button>
                                            </div>
                                        ) : (
                                            m.topics.map((t, tIdx) => (
                                                <div
                                                    key={t.id}
                                                    onClick={() => router.visit(route('topics.stages.index', t.id))}
                                                    className="group/topic flex items-center justify-between p-3 rounded-lg border border-line hover:bg-raised/80 dark:hover:bg-raised/80 transition cursor-pointer"
                                                >
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div className="w-7 h-7 rounded-md bg-gray-100 dark:bg-line flex items-center justify-center text-gray-500 dark:text-gray-400 shrink-0 group-hover/topic:text-accent transition">
                                                            <BookOpen className="w-3.5 h-3.5" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-semibold text-xs text-gray-900 dark:text-white truncate group-hover/topic:text-accent transition">
                                                                    {t.title}
                                                                </span>
                                                                <span
                                                                    className={`inline-flex items-center px-1.5 py-0.2 rounded text-[0.5625rem] font-semibold ${
                                                                        t.is_published
                                                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                                            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                                                    }`}
                                                                >
                                                                    {t.is_published ? 'Published' : 'Draft'}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-3 text-[0.625rem] text-gray-400 mt-0.5">
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

                                                            {/* Stages pill strip */}
                                                            {t.sections && t.sections.length > 0 && (
                                                                <div className="flex flex-wrap items-center gap-1 mt-1.5">
                                                                    {t.sections.map((sec) => (
                                                                        <span
                                                                            key={sec.id}
                                                                            className="inline-flex items-center px-1.5 py-0.2 rounded text-[0.5625rem] font-semibold uppercase tracking-wider bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200/50 dark:border-purple-800/40"
                                                                            title={`Stage: ${sec.title}`}
                                                                        >
                                                                            {sec.section_type}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div
                                                        className="flex items-center gap-1.5 shrink-0"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <Link
                                                            href={route('topics.stages.index', t.id)}
                                                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-accent bg-accent/10 hover:bg-accent/20 transition"
                                                            title="Open Pedagogical Stage Builder"
                                                        >
                                                            <Layers className="w-3.5 h-3.5" />
                                                            Stages ({t.sections_count || 0})
                                                        </Link>
                                                        <ActionDropdown align="right" widthClass="w-36">
                                                            <button
                                                                onClick={() => onEditTopic(t, m)}
                                                                className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-gray-700 dark:text-gray-200 hover:bg-raised dark:hover:bg-raised transition"
                                                            >
                                                                <Pencil className="w-3.5 h-3.5 text-gray-400" />
                                                                Edit Lesson
                                                            </button>
                                                            <button
                                                                onClick={() => onDeleteTopic(t, m)}
                                                                className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                                                Delete Lesson
                                                            </button>
                                                        </ActionDropdown>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
