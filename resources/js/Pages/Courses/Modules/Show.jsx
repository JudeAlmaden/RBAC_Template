import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Breadcrumbs from '@/Components/Breadcrumbs';

import ModuleHeroCard from './Partials/ModuleHeroCard';
import ModuleTopicList from './Partials/ModuleTopicList';
import TopicModal from '../Partials/TopicModal';
import ModuleModal from '../Partials/ModuleModal';

export default function ModuleShow({ course, module, siblingModules = [] }) {
    const [createTopicOpen, setCreateTopicOpen] = useState(false);
    const [editTopicOpen, setEditTopicOpen] = useState(false);
    const [selectedTopic, setSelectedTopic] = useState(null);

    const [editModuleOpen, setEditModuleOpen] = useState(false);

    const moduleForm = useForm({
        title: module.title,
        description: module.description || '',
        is_published: module.is_published,
    });

    const topicForm = useForm({
        title: '',
        description: '',
        estimated_minutes: '',
        is_published: false,
    });

    // Find current module index among siblings
    const currentIndex = siblingModules.findIndex((m) => m.id === module.id);
    const prevModule = currentIndex > 0 ? siblingModules[currentIndex - 1] : null;
    const nextModule = currentIndex < siblingModules.length - 1 ? siblingModules[currentIndex + 1] : null;

    const handleEditModuleSubmit = (e) => {
        e.preventDefault();
        moduleForm.put(route('courses.modules.update', [course.id, module.id]), {
            onSuccess: () => setEditModuleOpen(false),
        });
    };

    const handleDeleteModule = () => {
        if (!confirm(`Are you sure you want to delete module "${module.title}"?`)) return;
        router.delete(route('courses.modules.destroy', [course.id, module.id]), {
            onSuccess: () => router.visit(route('courses.show', course.id)),
        });
    };

    const openCreateTopic = () => {
        topicForm.reset();
        topicForm.clearErrors();
        setCreateTopicOpen(true);
    };

    const handleCreateTopicSubmit = (e) => {
        e.preventDefault();
        topicForm.post(route('modules.topics.store', module.id), {
            onSuccess: () => {
                setCreateTopicOpen(false);
                topicForm.reset();
            },
        });
    };

    const openEditTopic = (t) => {
        setSelectedTopic(t);
        topicForm.setData({
            title: t.title,
            description: t.description || '',
            estimated_minutes: t.estimated_minutes || '',
            is_published: t.is_published,
        });
        topicForm.clearErrors();
        setEditTopicOpen(true);
    };

    const handleEditTopicSubmit = (e) => {
        e.preventDefault();
        if (!selectedTopic) return;
        topicForm.put(route('modules.topics.update', [module.id, selectedTopic.id]), {
            onSuccess: () => {
                setEditTopicOpen(false);
                setSelectedTopic(null);
            },
        });
    };

    const handleDeleteTopic = (t) => {
        if (!confirm(`Are you sure you want to delete topic "${t.title}"?`)) return;
        router.delete(route('modules.topics.destroy', [module.id, t.id]));
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Module: ${module.title} - Nexus`} />

            <div className="max-w-6xl mx-auto space-y-6">
                {/* Navigation Breadcrumb & Sibling Pagers */}
                <div className="flex items-center justify-between gap-4 text-xs">
                    <Breadcrumbs
                        backHref={route('courses.show', course.id)}
                        items={[
                            { label: 'Courses', href: route('courses.index') },
                            { label: course.title, href: route('courses.show', course.id) },
                            { label: `Module ${currentIndex + 1}: ${module.title}` },
                        ]}
                    />

                    {/* Sibling Pager */}
                    <div className="flex items-center gap-1 shrink-0">
                        {prevModule ? (
                            <Link
                                href={route('courses.modules.show', [course.id, prevModule.id])}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-gray-200 dark:border-line bg-surface text-gray-700 dark:text-gray-300 hover:bg-raised text-[0.6875rem] font-medium transition"
                                title={`Previous: ${prevModule.title}`}
                            >
                                <ChevronLeft className="w-3.5 h-3.5" />
                                Prev
                            </Link>
                        ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-gray-100 dark:border-line text-gray-300 dark:text-gray-600 text-[0.6875rem] cursor-not-allowed">
                                <ChevronLeft className="w-3.5 h-3.5" />
                                Prev
                            </span>
                        )}

                        {nextModule ? (
                            <Link
                                href={route('courses.modules.show', [course.id, nextModule.id])}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-gray-200 dark:border-line bg-surface text-gray-700 dark:text-gray-300 hover:bg-raised text-[0.6875rem] font-medium transition"
                                title={`Next: ${nextModule.title}`}
                            >
                                Next
                                <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                        ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-gray-100 dark:border-line text-gray-300 dark:text-gray-600 text-[0.6875rem] cursor-not-allowed">
                                Next
                                <ChevronRight className="w-3.5 h-3.5" />
                            </span>
                        )}
                    </div>
                </div>

                {/* Hero / Header Card */}
                <ModuleHeroCard
                    module={module}
                    course={course}
                    currentIndex={currentIndex}
                    onAddLesson={openCreateTopic}
                    onEditModule={() => setEditModuleOpen(true)}
                    onDeleteModule={handleDeleteModule}
                />

                {/* Topics / Lessons List */}
                <ModuleTopicList
                    module={module}
                    currentIndex={currentIndex}
                    onAddLesson={openCreateTopic}
                    onEditTopic={openEditTopic}
                    onDeleteTopic={handleDeleteTopic}
                />
            </div>

            {/* Modals */}
            <ModuleModal
                show={editModuleOpen}
                onClose={() => setEditModuleOpen(false)}
                onSubmit={handleEditModuleSubmit}
                form={moduleForm}
                isEdit={true}
            />

            <TopicModal
                show={createTopicOpen}
                onClose={() => setCreateTopicOpen(false)}
                onSubmit={handleCreateTopicSubmit}
                form={topicForm}
                moduleTitle={module.title}
                isEdit={false}
            />

            <TopicModal
                show={editTopicOpen}
                onClose={() => {
                    setEditTopicOpen(false);
                    setSelectedTopic(null);
                }}
                onSubmit={handleEditTopicSubmit}
                form={topicForm}
                moduleTitle={module.title}
                isEdit={true}
            />
        </AuthenticatedLayout>
    );
}
