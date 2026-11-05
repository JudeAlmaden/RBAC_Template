import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm, Link } from '@inertiajs/react';
import {
    ChevronLeft,
    ChevronRight,
    Boxes,
    CheckCircle2,
    Lock,
    Pencil,
    Trash2,
    Layers,
} from 'lucide-react';
import Breadcrumbs from '@/Components/Breadcrumbs';
import ActionDropdown from '@/Components/ActionDropdown';
import { SECTION_TYPE_DETAILS } from './Partials/StageFormModal';
import StageFormModal from './Partials/StageFormModal';
import StagePagesList from './Partials/StagePagesList';
import StagePageModal from './Partials/StagePageModal';

export default function StageShow({
    topic,
    stage,
    prevStage,
    nextStage,
    availableSectionTypes = [],
    availableLayoutTypes = [],
}) {
    const [editStageOpen, setEditStageOpen] = useState(false);
    const [createPageOpen, setCreatePageOpen] = useState(false);
    const [editPageOpen, setEditPageOpen] = useState(false);
    const [selectedPage, setSelectedPage] = useState(null);

    // Stage Edit Form
    const stageForm = useForm({
        section_type: stage.section_type,
        title: stage.title,
        instructions: stage.instructions || '',
        is_required: stage.is_required,
        is_published: stage.is_published,
    });

    // Page Form
    const pageForm = useForm({
        title: '',
        layout_type: 'single_column',
        is_visible: true,
    });

    const openEditStage = () => {
        stageForm.setData({
            section_type: stage.section_type,
            title: stage.title,
            instructions: stage.instructions || '',
            is_required: stage.is_required,
            is_published: stage.is_published,
        });
        stageForm.clearErrors();
        setEditStageOpen(true);
    };

    const handleEditStageSubmit = (e) => {
        e.preventDefault();
        stageForm.put(route('topics.stages.update', [topic.id, stage.id]), {
            onSuccess: () => setEditStageOpen(false),
        });
    };

    const handleDeleteStage = () => {
        if (!confirm(`Are you sure you want to delete stage "${stage.title}"?`)) return;
        router.delete(route('topics.stages.destroy', [topic.id, stage.id]), {
            onSuccess: () => router.visit(route('topics.stages.index', topic.id)),
        });
    };

    // Container Page Handlers
    const openCreatePage = () => {
        const nextNumber = (stage.pages?.length || 0) + 1;
        pageForm.setData({
            title: `Page ${nextNumber}`,
            layout_type: 'single_column',
            is_visible: true,
        });
        pageForm.clearErrors();
        setCreatePageOpen(true);
    };

    const handleCreatePageSubmit = (e) => {
        e.preventDefault();
        pageForm.post(route('stages.pages.store', stage.id), {
            onSuccess: () => {
                setCreatePageOpen(false);
                pageForm.reset();
            },
        });
    };

    const openEditPage = (page) => {
        setSelectedPage(page);
        pageForm.setData({
            title: page.title || '',
            layout_type: page.layout_type,
            is_visible: page.is_visible,
        });
        pageForm.clearErrors();
        setEditPageOpen(true);
    };

    const handleEditPageSubmit = (e) => {
        e.preventDefault();
        if (!selectedPage) return;
        pageForm.put(route('stages.pages.update', [stage.id, selectedPage.id]), {
            onSuccess: () => {
                setEditPageOpen(false);
                setSelectedPage(null);
            },
        });
    };

    const handleDeletePage = (page) => {
        if (!confirm(`Are you sure you want to delete container page "${page.title || 'this page'}"?`)) return;
        router.delete(route('stages.pages.destroy', [stage.id, page.id]));
    };

    const handleMovePage = (index, direction) => {
        const pages = [...(stage.pages || [])];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= pages.length) return;

        const temp = pages[index];
        pages[index] = pages[targetIndex];
        pages[targetIndex] = temp;

        router.post(route('stages.pages.reorder', stage.id), {
            page_ids: pages.map((p) => p.id),
        });
    };

    const typeDetails = SECTION_TYPE_DETAILS[stage.section_type] || {
        label: stage.section_type,
        badge: 'bg-gray-100 text-gray-700',
        desc: '',
    };

    const stagesIndexHref = route('topics.stages.index', topic.id);

    return (
        <AuthenticatedLayout>
            <Head title={`${stage.title} — Nexus`} />

            <div className="max-w-6xl mx-auto space-y-6">

                {/* Top bar: breadcrumbs + prev/next */}
                <div className="flex items-center justify-between">
                    <Breadcrumbs
                        backHref={stagesIndexHref}
                        items={[
                            { label: 'Courses', href: route('courses.index') },
                            ...(topic.course?.id
                                ? [{ label: topic.course.title, href: route('courses.show', topic.course.id) }]
                                : []),
                            ...(topic.module?.id && topic.course?.id
                                ? [{ label: topic.module.title, href: route('courses.modules.show', [topic.course.id, topic.module.id]) }]
                                : []),
                            { label: topic.title, href: stagesIndexHref },
                            { label: stage.title },
                        ]}
                    />
                    <div className="flex items-center gap-1 shrink-0 ml-4">
                        <Link
                            href={prevStage ? route('topics.stages.show', [topic.id, prevStage.id]) : '#'}
                            aria-disabled={!prevStage}
                            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                                prevStage
                                    ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#26262D]'
                                    : 'text-gray-300 dark:text-gray-600 cursor-not-allowed pointer-events-none'
                            }`}
                        >
                            <ChevronLeft className="w-3.5 h-3.5" /> Prev
                        </Link>
                        <Link
                            href={nextStage ? route('topics.stages.show', [topic.id, nextStage.id]) : '#'}
                            aria-disabled={!nextStage}
                            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                                nextStage
                                    ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#26262D]'
                                    : 'text-gray-300 dark:text-gray-600 cursor-not-allowed pointer-events-none'
                            }`}
                        >
                            Next <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>

                {/* Stage Hero Card — clean, minimal */}
                <div className="bg-white dark:bg-[#15151A] rounded-xl border border-[#E8E8EC] dark:border-[#26262D] p-6 shadow-xs">

                    {/* Header row */}
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 space-y-1.5">
                            {/* Type badge + title + status */}
                            <div className="flex flex-wrap items-center gap-2">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${typeDetails.badge}`}>
                                    {typeDetails.label}
                                </span>
                                <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-snug">
                                    {stage.title}
                                </h1>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                    stage.is_published
                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                }`}>
                                    {stage.is_published ? 'Published' : 'Draft'}
                                </span>
                            </div>

                            {/* Instructions — only if present, as a simple muted line */}
                            {stage.instructions && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl">
                                    {stage.instructions}
                                </p>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 shrink-0">
                            <button
                                onClick={openEditStage}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-200 border border-[#E8E8EC] dark:border-[#26262D] bg-white dark:bg-[#1C1C24] hover:bg-gray-50 dark:hover:bg-[#26262D] shadow-2xs transition"
                            >
                                <Pencil className="w-3.5 h-3.5" />
                                Edit Stage
                            </button>
                            <ActionDropdown align="right" widthClass="w-40">
                                <button
                                    onClick={handleDeleteStage}
                                    className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Delete Stage
                                </button>
                            </ActionDropdown>
                        </div>
                    </div>

                    {/* Meta + stats — single compact row */}
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4 pt-4 border-t border-[#E8E8EC] dark:border-[#26262D] text-[11px] text-gray-400 dark:text-gray-500">
                        {/* Breadcrumb context */}
                        <span>
                            <Link href={stagesIndexHref} className="text-[#5B5FC7] dark:text-[#8A8DE2] hover:underline font-medium">
                                {topic.title}
                            </Link>
                            {topic.module?.id && topic.course?.id && (
                                <>
                                    {' · '}
                                    <Link
                                        href={route('courses.modules.show', [topic.course.id, topic.module.id])}
                                        className="text-gray-500 dark:text-gray-400 hover:underline"
                                    >
                                        {topic.module.title}
                                    </Link>
                                </>
                            )}
                            {topic.course?.id && (
                                <>
                                    {' · '}
                                    <Link
                                        href={route('courses.show', topic.course.id)}
                                        className="text-[#4A91CC] hover:underline"
                                    >
                                        {topic.course.title}
                                    </Link>
                                </>
                            )}
                        </span>

                        <span className="text-[#E8E8EC] dark:text-[#26262D]">|</span>

                        {/* Inline stat chips */}
                        <span className="flex items-center gap-1">
                            <Layers className="w-3 h-3" />
                            {stage.pages?.length || 0} pages
                        </span>
                        <span className="flex items-center gap-1">
                            <Boxes className="w-3 h-3" />
                            {stage.blocks_count ?? 0} components
                        </span>
                        <span className="flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            {stage.activities_count ?? 0} activities
                        </span>
                        {stage.is_required && (
                            <span className="flex items-center gap-1">
                                <Lock className="w-3 h-3" />
                                Required
                            </span>
                        )}
                    </div>
                </div>

                {/* Container Pages List (holds layouts & components) */}
                <StagePagesList
                    pages={stage.pages || []}
                    onAddPage={openCreatePage}
                    onEditPage={openEditPage}
                    onDeletePage={handleDeletePage}
                    onMovePage={handleMovePage}
                />

                {/* Learning Activities */}
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
                        <p className="text-xs text-gray-400 dark:text-gray-500">No activities yet. Activity builder coming soon.</p>
                    </div>
                </div>

            </div>

            {/* Stage Edit Modal */}
            <StageFormModal
                show={editStageOpen}
                onClose={() => setEditStageOpen(false)}
                onSubmit={handleEditStageSubmit}
                form={stageForm}
                availableSectionTypes={availableSectionTypes}
                availableLayoutTypes={availableLayoutTypes}
                isEdit={true}
            />

            {/* Page Create Modal */}
            <StagePageModal
                show={createPageOpen}
                onClose={() => setCreatePageOpen(false)}
                onSubmit={handleCreatePageSubmit}
                form={pageForm}
                isEdit={false}
            />

            {/* Page Edit Modal */}
            <StagePageModal
                show={editPageOpen}
                onClose={() => {
                    setEditPageOpen(false);
                    setSelectedPage(null);
                }}
                onSubmit={handleEditPageSubmit}
                form={pageForm}
                isEdit={true}
            />
        </AuthenticatedLayout>
    );
}
