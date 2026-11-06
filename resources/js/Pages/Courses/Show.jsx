import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Layers, Users } from 'lucide-react';
import Breadcrumbs from '@/Components/Breadcrumbs';

import CourseHeroCard from './Partials/CourseHeroCard';
import CourseCurriculumTab from './Partials/CourseCurriculumTab';
import CourseLearnersTab from './Partials/CourseLearnersTab';

import CourseFormModal from './Partials/CourseFormModal';
import DeleteCourseModal from './Partials/DeleteCourseModal';
import AssignCourseModal from './Partials/AssignCourseModal';
import ModuleModal from './Partials/ModuleModal';
import TopicModal from './Partials/TopicModal';

export default function CourseShow({ course, allCourses = [] }) {
    const [activeTab, setActiveTab] = useState('curriculum');
    // Every module starts collapsed; the header chevron toggles its topics.
    const [expandedModules, setExpandedModules] = useState({});

    // Course Modals State
    const [editCourseOpen, setEditCourseOpen] = useState(false);
    const [deleteCourseOpen, setDeleteCourseOpen] = useState(false);
    const [assignCourseOpen, setAssignCourseOpen] = useState(false);

    // Module Modals State
    const [createModuleOpen, setCreateModuleOpen] = useState(false);
    const [editModuleOpen, setEditModuleOpen] = useState(false);
    const [selectedModule, setSelectedModule] = useState(null);

    // Topic Modals State
    const [createTopicOpen, setCreateTopicOpen] = useState(false);
    const [editTopicOpen, setEditTopicOpen] = useState(false);
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [targetModuleForTopic, setTargetModuleForTopic] = useState(null);

    // Forms
    const editCourseForm = useForm({
        title: course.title,
        description: course.description || '',
        status: course.status,
        prerequisite_ids: (course.prerequisites || []).map((p) => p.id),
        auto_enroll_prerequisites: (course.prerequisites || []).some((p) => p.auto_enroll),
    });

    const moduleForm = useForm({
        title: '',
        description: '',
        is_published: false,
    });

    const topicForm = useForm({
        title: '',
        description: '',
        estimated_minutes: '',
        is_published: false,
    });

    const toggleModuleExpand = (moduleId) => {
        setExpandedModules((prev) => ({
            ...prev,
            [moduleId]: !prev[moduleId],
        }));
    };

    // Course Handlers
    const handleEditCourseSubmit = (e) => {
        e.preventDefault();
        editCourseForm.put(route('courses.update', course.id), {
            onSuccess: () => setEditCourseOpen(false),
        });
    };

    const handleDeleteCourseConfirm = () => {
        router.delete(route('courses.destroy', course.id), {
            onSuccess: () => setDeleteCourseOpen(false),
        });
    };

    // Module Handlers
    const openCreateModule = () => {
        moduleForm.reset();
        moduleForm.clearErrors();
        setCreateModuleOpen(true);
    };

    const handleCreateModuleSubmit = (e) => {
        e.preventDefault();
        moduleForm.post(route('courses.modules.store', course.id), {
            onSuccess: () => {
                setCreateModuleOpen(false);
                moduleForm.reset();
            },
        });
    };

    const openEditModule = (m) => {
        setSelectedModule(m);
        moduleForm.setData({
            title: m.title,
            description: m.description || '',
            is_published: m.is_published,
        });
        moduleForm.clearErrors();
        setEditModuleOpen(true);
    };

    const handleEditModuleSubmit = (e) => {
        e.preventDefault();
        if (!selectedModule) return;
        moduleForm.put(route('courses.modules.update', [course.id, selectedModule.id]), {
            onSuccess: () => {
                setEditModuleOpen(false);
                setSelectedModule(null);
            },
        });
    };

    const handleDeleteModule = (m) => {
        if (!confirm(`Are you sure you want to delete module "${m.title}" and all its lessons?`)) return;
        router.delete(route('courses.modules.destroy', [course.id, m.id]));
    };

    // Topic Handlers
    const openCreateTopic = (m) => {
        setTargetModuleForTopic(m);
        topicForm.reset();
        topicForm.clearErrors();
        setCreateTopicOpen(true);
    };

    const handleCreateTopicSubmit = (e) => {
        e.preventDefault();
        if (!targetModuleForTopic) return;
        topicForm.post(route('modules.topics.store', targetModuleForTopic.id), {
            onSuccess: () => {
                setCreateTopicOpen(false);
                topicForm.reset();
                setTargetModuleForTopic(null);
            },
        });
    };

    const openEditTopic = (t, m) => {
        setSelectedTopic(t);
        setTargetModuleForTopic(m);
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
        if (!selectedTopic || !targetModuleForTopic) return;
        topicForm.put(route('modules.topics.update', [targetModuleForTopic.id, selectedTopic.id]), {
            onSuccess: () => {
                setEditTopicOpen(false);
                setSelectedTopic(null);
                setTargetModuleForTopic(null);
            },
        });
    };

    const handleDeleteTopic = (t, m) => {
        if (!confirm(`Are you sure you want to delete topic "${t.title}"?`)) return;
        router.delete(route('modules.topics.destroy', [m.id, t.id]));
    };

    const totalTopics = (course.modules || []).reduce(
        (sum, m) => sum + (m.topics ? m.topics.length : 0),
        0
    );

    return (
        <AuthenticatedLayout>
            <Head title={`Course: ${course.title} - Nexus`} />

            <div className="max-w-7xl mx-auto space-y-6">
                {/* Back button & Breadcrumbs */}
                <Breadcrumbs
                    backHref={route('courses.index')}
                    items={[
                        { label: 'Courses', href: route('courses.index') },
                        { label: course.title },
                    ]}
                />

                {/* Hero / Header Card */}
                <CourseHeroCard
                    course={course}
                    totalTopics={totalTopics}
                    onAssignLearner={() => setAssignCourseOpen(true)}
                    onEditCourse={() => setEditCourseOpen(true)}
                    onDeleteCourse={() => setDeleteCourseOpen(true)}
                />

                {/* Tabs bar */}
                <div className="flex items-center gap-2 border-b border-[#E8E8EC] dark:border-[#26262D] text-xs font-semibold">
                    <button
                        onClick={() => setActiveTab('curriculum')}
                        className={`inline-flex items-center gap-2 py-3 px-4 border-b-2 transition ${
                            activeTab === 'curriculum'
                                ? 'border-[#4A91CC] text-[#4A91CC]'
                                : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                        }`}
                    >
                        <Layers className="w-4 h-4" />
                        Curriculum Outline
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-gray-100 dark:bg-[#26262D] text-gray-600 dark:text-gray-300">
                            {course.modules?.length || 0}
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab('learners')}
                        className={`inline-flex items-center gap-2 py-3 px-4 border-b-2 transition ${
                            activeTab === 'learners'
                                ? 'border-[#4A91CC] text-[#4A91CC]'
                                : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                        }`}
                    >
                        <Users className="w-4 h-4" />
                        Enrolled Learners
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-gray-100 dark:bg-[#26262D] text-gray-600 dark:text-gray-300">
                            {course.enrollments?.length || 0}
                        </span>
                    </button>
                </div>

                {/* Tab Content: CURRICULUM */}
                {activeTab === 'curriculum' && (
                    <CourseCurriculumTab
                        course={course}
                        expandedModules={expandedModules}
                        toggleModuleExpand={toggleModuleExpand}
                        onAddModule={openCreateModule}
                        onEditModule={openEditModule}
                        onDeleteModule={handleDeleteModule}
                        onAddTopic={openCreateTopic}
                        onEditTopic={openEditTopic}
                        onDeleteTopic={handleDeleteTopic}
                    />
                )}

                {/* Tab Content: LEARNERS */}
                {activeTab === 'learners' && (
                    <CourseLearnersTab
                        course={course}
                        onAssignLearner={() => setAssignCourseOpen(true)}
                    />
                )}
            </div>

            {/* Modals */}
            <CourseFormModal
                show={editCourseOpen}
                onClose={() => setEditCourseOpen(false)}
                onSubmit={handleEditCourseSubmit}
                form={editCourseForm}
                isEdit={true}
                allCourses={allCourses}
            />

            <DeleteCourseModal
                show={deleteCourseOpen}
                onClose={() => setDeleteCourseOpen(false)}
                onConfirm={handleDeleteCourseConfirm}
                courseTitle={course.title}
            />

            <AssignCourseModal
                show={assignCourseOpen}
                onClose={() => setAssignCourseOpen(false)}
                course={course}
            />

            <ModuleModal
                show={createModuleOpen}
                onClose={() => setCreateModuleOpen(false)}
                onSubmit={handleCreateModuleSubmit}
                form={moduleForm}
                isEdit={false}
            />

            <ModuleModal
                show={editModuleOpen}
                onClose={() => {
                    setEditModuleOpen(false);
                    setSelectedModule(null);
                }}
                onSubmit={handleEditModuleSubmit}
                form={moduleForm}
                isEdit={true}
            />

            <TopicModal
                show={createTopicOpen}
                onClose={() => {
                    setCreateTopicOpen(false);
                    setTargetModuleForTopic(null);
                }}
                onSubmit={handleCreateTopicSubmit}
                form={topicForm}
                moduleTitle={targetModuleForTopic?.title}
                isEdit={false}
            />

            <TopicModal
                show={editTopicOpen}
                onClose={() => {
                    setEditTopicOpen(false);
                    setSelectedTopic(null);
                    setTargetModuleForTopic(null);
                }}
                onSubmit={handleEditTopicSubmit}
                form={topicForm}
                moduleTitle={targetModuleForTopic?.title}
                isEdit={true}
            />
        </AuthenticatedLayout>
    );
}
