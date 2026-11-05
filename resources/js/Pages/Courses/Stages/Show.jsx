import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import {
    ChevronLeft,
    ChevronRight,
    Layout,
    Boxes,
    CheckCircle2,
    Lock,
    Unlock,
    Pencil,
    Trash2,
} from 'lucide-react';
import Breadcrumbs from '@/Components/Breadcrumbs';
import ActionDropdown from '@/Components/ActionDropdown';
import { SECTION_TYPE_DETAILS, LAYOUT_TYPE_DETAILS } from './Partials/StageFormModal';
import StageFormModal from './Partials/StageFormModal';

export default function StageShow({
    topic,
    stage,
    prevStage,
    nextStage,
    availableSectionTypes = [],
    availableLayoutTypes = [],
}) {
    const [editOpen, setEditOpen] = useState(false);

    const form = useForm({
        section_type: stage.section_type,
        layout_type: stage.layout_type,
        title: stage.title,
        instructions: stage.instructions || '',
        is_required: stage.is_required,
        is_published: stage.is_published,
    });

    const openEdit = () => {
        form.setData({
            section_type: stage.section_type,
            layout_type: stage.layout_type,
            title: stage.title,
            instructions: stage.instructions || '',
            is_required: stage.is_required,
            is_published: stage.is_published,
        });
        form.clearErrors();
        setEditOpen(true);
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        form.put(route('topics.stages.update', [topic.id, stage.id]), {
            onSuccess: () => setEditOpen(false),
        });
    };

    const handleDelete = () => {
        if (!confirm(`Are you sure you want to delete stage "${stage.title}"?`)) return;
        router.delete(route('topics.stages.destroy', [topic.id, stage.id]), {
            onSuccess: () => {
                router.visit(route('topics.stages.index', topic.id));
            },
        });
    };

    const typeDetails = SECTION_TYPE_DETAILS[stage.section_type] || {
        label: stage.section_type,
        badge: 'bg-gray-100 text-gray-700',
        desc: '',
    };

    const layoutLabel = LAYOUT_TYPE_DETAILS[stage.layout_type]?.label || stage.layout_type;

    const stagesIndexHref = route('topics.stages.index', topic.id);

    return (
        <AuthenticatedLayout>
            <Head title={`${stage.title} — Nexus`} />

            <div className="max-w-6xl mx-auto space-y-6">
                {/* Breadcrumbs + Prev/Next pager */}
                <div className="flex items-center justify-between">
                    <Breadcrumbs
                        backHref={stagesIndexHref}
                        items={[
                            { label: 'Courses', href: route('courses.index') },
                            ...(topic.course?.id
                                ? [{ label: topic.course.title, href: route('courses.show', topic.course.id) }]
                                : []),
                            ...(topic.module?.id && topic.course?.id
                                ? [
                                      {
                                          label: topic.module.title,
                                          href: route('courses.modules.show', [topic.course.id, topic.module.id]),
                                      },
                                  ]
                                : []),
                            { label: topic.title, href: stagesIndexHref },
                            { label: stage.title },
                        ]}
                    />

                    <div className="flex items-center gap-1 shrink-0 ml-4">
                        <Link
                            href={prevStage ? route('topics.stages.show', [topic.id, prevStage.id]) : '#'}
                            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                                prevStage
                                    ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#26262D]'
                                    : 'text-gray-300 dark:text-gray-600 cursor-not-allowed pointer-events-none'
                            }`}
                            aria-disabled={!prevStage}
                        >
                            <ChevronLeft className="w-3.5 h-3.5" />
                            Prev
                        </Link>
                        <Link
                            href={nextStage ? route('topics.stages.show', [topic.id, nextStage.id]) : '#'}
                            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                                nextStage
                                    ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#26262D]'
                                    : 'text-gray-300 dark:text-gray-600 cursor-not-allowed pointer-events-none'
                            }`}
                            aria-disabled={!nextStage}
                        >
                            Next
                            <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>

                {/* Stage Hero Card */}
                <div className="bg-white dark:bg-[#15151A] rounded-xl border border-[#E8E8EC] dark:border-[#26262D] p-6 shadow-xs">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        {/* Left: icon + details */}
                        <div className="flex items-start gap-4">
                            <div className="w-14 h-14 rounded-xl bg-[#5B5FC7]/10 dark:bg-[#5B5FC7]/20 flex items-center justify-center shrink-0">
                                <span className="text-xl font-bold text-[#5B5FC7] dark:text-[#8A8DE2]">
                                    {stage.position ?? '—'}
                                </span>
                            </div>
                            <div className="space-y-2">
                                <div className="flex flex-wrap items-center gap-2.5">
                                    <span
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${typeDetails.badge}`}
                                    >
                                        {typeDetails.label}
                                    </span>
                                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                                        {stage.title}
                                    </h1>
                                    <span
                                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                            stage.is_published
                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                        }`}
                                    >
                                        {stage.is_published ? 'Published' : 'Draft'}
                                    </span>
                                </div>

                                {typeDetails.desc && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 max-w-2xl leading-relaxed">
                                        {typeDetails.desc}
                                    </p>
                                )}

                                {stage.instructions && (
                                    <p className="text-xs text-gray-600 dark:text-gray-300 max-w-2xl leading-relaxed bg-[#FAFAFC] dark:bg-[#1C1C24] border border-[#E8E8EC] dark:border-[#26262D] rounded-lg px-3 py-2">
                                        {stage.instructions}
                                    </p>
                                )}

                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-[11px] text-gray-500 dark:text-gray-400">
                                    <span>
                                        Topic:{' '}
                                        <Link
                                            href={stagesIndexHref}
                                            className="font-medium text-[#5B5FC7] hover:underline"
                                        >
                                            {topic.title}
                                        </Link>
                                    </span>
                                    <span>•</span>
                                    {topic.module?.id && topic.course?.id && (
                                        <>
                                            <span>
                                                Module:{' '}
                                                <Link
                                                    href={route('courses.modules.show', [topic.course.id, topic.module.id])}
                                                    className="font-medium text-gray-700 dark:text-gray-300 hover:underline"
                                                >
                                                    {topic.module.title}
                                                </Link>
                                            </span>
                                            <span>•</span>
                                        </>
                                    )}
                                    {topic.course?.id && (
                                        <span>
                                            Course:{' '}
                                            <Link
                                                href={route('courses.show', topic.course.id)}
                                                className="font-medium text-[#4A91CC] hover:underline"
                                            >
                                                {topic.course.title}
                                            </Link>
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right: action buttons */}
                        <div className="flex items-center gap-1.5 self-start shrink-0">
                            <button
                                onClick={openEdit}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-200 border border-[#E8E8EC] dark:border-[#26262D] bg-white dark:bg-[#1C1C24] hover:bg-gray-50 dark:hover:bg-[#26262D] shadow-2xs transition"
                            >
                                <Pencil className="w-3.5 h-3.5" />
                                Edit Stage
                            </button>
                            <ActionDropdown align="right" widthClass="w-40">
                                <button
                                    onClick={handleDelete}
                                    className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Delete Stage
                                </button>
                            </ActionDropdown>
                        </div>
                    </div>

                    {/* Stats grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-[#E8E8EC] dark:border-[#26262D]">
                        <div className="p-3 rounded-lg bg-[#FAFAFC] dark:bg-[#1C1C24] border border-[#E8E8EC]/80 dark:border-[#26262D]">
                            <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                                <Boxes className="w-3 h-3" />
                                Content Blocks
                            </div>
                            <div className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
                                {stage.blocks_count ?? 0}
                            </div>
                        </div>
                        <div className="p-3 rounded-lg bg-[#FAFAFC] dark:bg-[#1C1C24] border border-[#E8E8EC]/80 dark:border-[#26262D]">
                            <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                                <CheckCircle2 className="w-3 h-3" />
                                Activities
                            </div>
                            <div className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
                                {stage.activities_count ?? 0}
                            </div>
                        </div>
                        <div className="p-3 rounded-lg bg-[#FAFAFC] dark:bg-[#1C1C24] border border-[#E8E8EC]/80 dark:border-[#26262D]">
                            <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                                <Layout className="w-3 h-3" />
                                Layout
                            </div>
                            <div className="text-sm font-bold text-gray-900 dark:text-white mt-0.5 truncate">
                                {layoutLabel}
                            </div>
                        </div>
                        <div className="p-3 rounded-lg bg-[#FAFAFC] dark:bg-[#1C1C24] border border-[#E8E8EC]/80 dark:border-[#26262D]">
                            <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                                {stage.is_required ? (
                                    <Lock className="w-3 h-3" />
                                ) : (
                                    <Unlock className="w-3 h-3" />
                                )}
                                Required
                            </div>
                            <div className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">
                                {stage.is_required ? 'Yes' : 'Optional'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Blocks placeholder */}
                <div className="bg-white dark:bg-[#15151A] rounded-xl border border-[#E8E8EC] dark:border-[#26262D] p-6 shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Content Blocks</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                Media, text, embeds and interactive elements within this stage.
                            </p>
                        </div>
                    </div>
                    <div className="rounded-lg border border-dashed border-[#E8E8EC] dark:border-[#26262D] p-8 text-center">
                        <Boxes className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                            No content blocks yet. Content builder coming soon.
                        </p>
                    </div>
                </div>

                {/* Learning Activities placeholder */}
                <div className="bg-white dark:bg-[#15151A] rounded-xl border border-[#E8E8EC] dark:border-[#26262D] p-6 shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Learning Activities</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                Quizzes, exercises, and assessments linked to this stage.
                            </p>
                        </div>
                    </div>
                    <div className="rounded-lg border border-dashed border-[#E8E8EC] dark:border-[#26262D] p-8 text-center">
                        <CheckCircle2 className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                            No activities yet. Activity builder coming soon.
                        </p>
                    </div>
                </div>
            </div>

            {/* Edit Stage Modal */}
            <StageFormModal
                show={editOpen}
                onClose={() => setEditOpen(false)}
                onSubmit={handleEditSubmit}
                form={form}
                availableSectionTypes={availableSectionTypes}
                availableLayoutTypes={availableLayoutTypes}
                isEdit={true}
            />
        </AuthenticatedLayout>
    );
}

