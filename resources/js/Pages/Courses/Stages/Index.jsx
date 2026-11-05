import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import Breadcrumbs from '@/Components/Breadcrumbs';

import StageHeroCard from './Partials/StageHeroCard';
import StagePipelineList from './Partials/StagePipelineList';
import StageFormModal from './Partials/StageFormModal';

export default function StagesIndex({ topic, availableSectionTypes = [], availableLayoutTypes = [] }) {
    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [selectedStage, setSelectedStage] = useState(null);

    const form = useForm({
        section_type: 'activate',
        layout_type: 'single_column',
        title: '',
        instructions: '',
        is_required: true,
        is_published: false,
    });

    const openCreate = () => {
        form.setData({
            section_type: 'activate',
            layout_type: 'single_column',
            title: 'Activate: Warm-up & Context',
            instructions: '',
            is_required: true,
            is_published: false,
        });
        form.clearErrors();
        setCreateOpen(true);
    };

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        form.post(route('topics.stages.store', topic.id), {
            onSuccess: () => {
                setCreateOpen(false);
                form.reset();
            },
        });
    };

    const openEdit = (stage) => {
        setSelectedStage(stage);
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
        if (!selectedStage) return;
        form.put(route('topics.stages.update', [topic.id, selectedStage.id]), {
            onSuccess: () => {
                setEditOpen(false);
                setSelectedStage(null);
            },
        });
    };

    const handleDelete = (stage) => {
        if (!confirm(`Are you sure you want to delete stage "${stage.title}"?`)) return;
        router.delete(route('topics.stages.destroy', [topic.id, stage.id]));
    };

    const handleMove = (index, direction) => {
        const sections = [...topic.sections];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= sections.length) return;

        const temp = sections[index];
        sections[index] = sections[targetIndex];
        sections[targetIndex] = temp;

        router.post(route('topics.stages.reorder', topic.id), {
            stage_ids: sections.map((s) => s.id),
        });
    };

    const handleApplyPreset = (presetKey) => {
        if (topic.sections && topic.sections.length > 0) {
            if (!confirm('This will append the selected preset stages to your existing stages. Proceed?')) {
                return;
            }
        }
        router.post(route('topics.stages.preset', topic.id), {
            preset: presetKey,
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Stages: ${topic.title} - Nexus`} />

            <div className="max-w-6xl mx-auto space-y-6">
                {/* Breadcrumbs & Navigation */}
                <Breadcrumbs
                    backHref={
                        topic.module?.id && topic.course?.id
                            ? route('courses.modules.show', [topic.course.id, topic.module.id])
                            : topic.course?.id
                              ? route('courses.show', topic.course.id)
                              : route('courses.index')
                    }
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
                            : topic.module?.title
                              ? [{ label: topic.module.title }]
                              : []),
                        { label: topic.title },
                    ]}
                />

                {/* Hero / Header Card */}
                <StageHeroCard
                    topic={topic}
                    onApplyPreset={handleApplyPreset}
                    onAddStage={openCreate}
                />

                {/* Stages List Pipeline */}
                <StagePipelineList
                    topic={topic}
                    onMove={handleMove}
                    onDelete={handleDelete}
                    onAddStage={openCreate}
                    onApplyPreset={handleApplyPreset}
                />
            </div>

            {/* Modals */}
            <StageFormModal
                show={createOpen}
                onClose={() => setCreateOpen(false)}
                onSubmit={handleCreateSubmit}
                form={form}
                availableSectionTypes={availableSectionTypes}
                availableLayoutTypes={availableLayoutTypes}
                isEdit={false}
            />

            <StageFormModal
                show={editOpen}
                onClose={() => {
                    setEditOpen(false);
                    setSelectedStage(null);
                }}
                onSubmit={handleEditSubmit}
                form={form}
                availableSectionTypes={availableSectionTypes}
                availableLayoutTypes={availableLayoutTypes}
                isEdit={true}
            />
        </AuthenticatedLayout>
    );
}
