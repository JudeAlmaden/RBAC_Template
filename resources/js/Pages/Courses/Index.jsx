import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useDebounce } from '@/hooks/useDebounce';
import { GraduationCap, Plus, Search, Pencil, Trash2, UserPlus, GitFork, AlertCircle, Eye, MoreHorizontal } from 'lucide-react';
import Pagination from '@/Components/Pagination';
import ActionDropdown from '@/Components/ActionDropdown';
import CourseFormModal from './Partials/CourseFormModal';
import DeleteCourseModal from './Partials/DeleteCourseModal';
import AssignCourseModal from './Partials/AssignCourseModal';

const STATUS_BADGE = {
    published: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    draft:     'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    archived:  'bg-gray-100 text-gray-500 dark:bg-gray-800/50 dark:text-gray-400',
};

export default function CoursesIndex({ courses, allCourses = [], filters = {} }) {
    const [search, setSearch]   = useState(filters.search || '');
    const [status, setStatus]   = useState(filters.status || '');
    const debouncedSearch = useDebounce(search, 300);

    const [createOpen, setCreateOpen]   = useState(false);
    const [editOpen, setEditOpen]       = useState(false);
    const [deleteOpen, setDeleteOpen]   = useState(false);
    const [assignOpen, setAssignOpen]   = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);

    const createForm = useForm({
        title: '',
        description: '',
        status: 'draft',
        prerequisite_ids: [],
        auto_enroll_prerequisites: true,
    });

    const editForm = useForm({
        title: '',
        description: '',
        status: 'draft',
        prerequisite_ids: [],
        auto_enroll_prerequisites: true,
    });

    useEffect(() => {
        router.get(route('courses.index'), { search: debouncedSearch, status }, {
            preserveState: true,
            replace: true,
        });
    }, [debouncedSearch, status]);

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        createForm.post(route('courses.store'), {
            onSuccess: () => {
                setCreateOpen(false);
                createForm.reset();
            },
        });
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        if (!selectedCourse) return;
        editForm.put(route('courses.update', selectedCourse.id), {
            onSuccess: () => {
                setEditOpen(false);
                setSelectedCourse(null);
            },
        });
    };

    const handleDeleteConfirm = () => {
        if (!selectedCourse) return;
        router.delete(route('courses.destroy', selectedCourse.id), {
            onSuccess: () => {
                setDeleteOpen(false);
                setSelectedCourse(null);
            },
        });
    };

    const openEdit = (course) => {
        setSelectedCourse(course);
        const prereqIds = (course.prerequisites || []).map((p) => p.id);
        const anyAuto = course.prerequisites?.some((p) => p.auto_enroll) ?? true;
        editForm.setData({
            title: course.title,
            description: course.description || '',
            status: course.status,
            prerequisite_ids: prereqIds,
            auto_enroll_prerequisites: anyAuto,
        });
        editForm.clearErrors();
        setEditOpen(true);
    };

    const openDelete = (course) => {
        setSelectedCourse(course);
        setDeleteOpen(true);
    };

    const openAssign = (course) => {
        setSelectedCourse(course);
        setAssignOpen(true);
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h1 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                        Course Management
                    </h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Create, manage, prerequisites, and assign courses to learners
                    </p>
                </div>
            }
        >
            <Head title="Courses" />

            <div className="space-y-5">
                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1">
                        <div className="relative w-full sm:w-72">
                            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search courses..."
                                className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-[#15151A] border border-[#E8E8EC] dark:border-[#26262D] rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#5B5FC7] focus:outline-none transition"
                            />
                        </div>

                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="text-xs bg-white dark:bg-[#15151A] border border-[#E8E8EC] dark:border-[#26262D] rounded-lg px-3 py-2 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#5B5FC7] focus:outline-none"
                        >
                            <option value="">All Statuses</option>
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                            <option value="archived">Archived</option>
                        </select>
                    </div>

                    <button
                        onClick={() => { createForm.reset(); setCreateOpen(true); }}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#5B5FC7] hover:bg-[#484CB8] text-white text-xs font-semibold shadow-sm transition"
                    >
                        <Plus className="w-4 h-4" />
                        New Course
                    </button>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-[#15151A] rounded-xl border border-[#E8E8EC] dark:border-[#26262D] shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-[#E8E8EC] dark:border-[#26262D] bg-[#FAFAFC] dark:bg-[#1C1C24]">
                                    <th className="py-3.5 px-5 font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[10px]">
                                        Course
                                    </th>
                                    <th className="py-3.5 px-5 font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[10px]">
                                        Status
                                    </th>
                                    <th className="py-3.5 px-5 font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[10px]">
                                        Prerequisites
                                    </th>
                                    <th className="py-3.5 px-5 font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[10px]">
                                        Enrollments
                                    </th>
                                    <th className="py-3.5 px-5 font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[10px]">
                                        Created
                                    </th>
                                    <th className="py-3.5 px-5 text-center font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[10px]">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E8E8EC] dark:divide-[#26262D]">
                                {courses.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-16 text-center">
                                            <GraduationCap className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No courses found</p>
                                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                                {search || status ? 'Try adjusting your filters.' : 'Create your first course to get started.'}
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    courses.data.map((course) => (
                                        <tr
                                            key={course.id}
                                            onClick={() => router.visit(route('courses.show', course.id))}
                                            className="group hover:bg-[#FAFAFC] dark:hover:bg-[#1C1C24] transition-colors cursor-pointer"
                                        >
                                            <td className="py-2.5 px-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-7 h-7 rounded-lg bg-[#4A91CC]/10 dark:bg-[#4A91CC]/20 flex items-center justify-center shrink-0 group-hover:bg-[#4A91CC]/20 transition">
                                                        <GraduationCap className="w-3.5 h-3.5 text-[#4A91CC]" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <span className="font-semibold text-xs text-gray-900 dark:text-white truncate max-w-xs block group-hover:text-[#4A91CC] transition">
                                                            {course.title}
                                                        </span>
                                                        {course.description && (
                                                            <div className="text-[10px] text-gray-400 truncate max-w-xs mt-0.5">
                                                                {course.description}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-2.5 px-5">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${STATUS_BADGE[course.status] ?? STATUS_BADGE.draft}`}>
                                                    {course.status}
                                                </span>
                                            </td>
                                            <td className="py-2.5 px-5">
                                                {course.prerequisites && course.prerequisites.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1 max-w-xs">
                                                        {course.prerequisites.map((p) => (
                                                            <span
                                                                key={p.id}
                                                                className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40 text-[9px] font-medium"
                                                                title={`Prerequisite: ${p.title} (${p.auto_enroll ? 'Auto-adds' : 'Manual'})`}
                                                            >
                                                                <GitFork className="w-2.5 h-2.5 shrink-0" />
                                                                <span className="truncate max-w-[120px]">{p.title}</span>
                                                                {p.auto_enroll && (
                                                                    <span className="text-[8px] font-bold text-indigo-500 dark:text-indigo-400 ml-0.5">
                                                                        [Auto]
                                                                    </span>
                                                                )}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 text-[11px]">—</span>
                                                )}
                                            </td>
                                            <td className="py-2.5 px-5">
                                                <span className="text-gray-700 dark:text-gray-300 font-medium text-xs">
                                                    {course.enrollments_count}
                                                </span>
                                                <span className="text-gray-400 ml-1 text-[11px]">learner{course.enrollments_count !== 1 ? 's' : ''}</span>
                                            </td>
                                            <td className="py-2.5 px-5 text-gray-500 dark:text-gray-400 text-[11px]">
                                                <div>{course.created_at}</div>
                                                {course.created_by_name && (
                                                    <div className="text-[10px] text-gray-400 mt-0.5">by {course.created_by_name}</div>
                                                )}
                                            </td>
                                            <td
                                                className="py-2.5 px-5"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <div className="flex items-center justify-center gap-1">
                                                    {/* Quick View Icon */}
                                                    <Link
                                                        href={route('courses.show', course.id)}
                                                        title="View Course"
                                                        className="w-7 h-7 rounded-md flex items-center justify-center text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#26262D] transition"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                    </Link>

                                                    {/* Assign Learner Icon */}
                                                    <button
                                                        onClick={() => openAssign(course)}
                                                        title="Assign to Learner"
                                                        className="w-7 h-7 rounded-md flex items-center justify-center text-[#4A91CC] hover:bg-[#4A91CC]/10 transition"
                                                    >
                                                        <UserPlus className="w-3.5 h-3.5" />
                                                    </button>

                                                    {/* More Actions Menu */}
                                                    <ActionDropdown align="right" widthClass="w-36">
                                                        <button
                                                            onClick={() => openEdit(course)}
                                                            className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#26262D] transition"
                                                        >
                                                            <Pencil className="w-3.5 h-3.5 text-gray-400" />
                                                            Edit Course
                                                        </button>
                                                        <button
                                                            onClick={() => openDelete(course)}
                                                            className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                                            Delete
                                                        </button>
                                                    </ActionDropdown>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {courses.links && courses.links.length > 3 && (
                        <div className="p-3.5 border-t border-[#E8E8EC] dark:border-[#26262D]">
                            <Pagination links={courses.links} />
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            <CourseFormModal
                show={createOpen}
                onClose={() => setCreateOpen(false)}
                form={createForm}
                onSubmit={handleCreateSubmit}
                mode="create"
                allCourses={allCourses}
            />

            <CourseFormModal
                show={editOpen}
                onClose={() => setEditOpen(false)}
                form={editForm}
                onSubmit={handleEditSubmit}
                mode="edit"
                allCourses={allCourses}
                editingCourse={selectedCourse}
            />

            <DeleteCourseModal
                show={deleteOpen}
                onClose={() => setDeleteOpen(false)}
                course={selectedCourse}
                onConfirm={handleDeleteConfirm}
            />

            <AssignCourseModal
                show={assignOpen}
                onClose={() => { setAssignOpen(false); setSelectedCourse(null); }}
                course={selectedCourse}
            />
        </AuthenticatedLayout>
    );
}
