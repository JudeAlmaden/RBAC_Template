import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { BookOpen, Clock, ChevronRight, GraduationCap } from 'lucide-react';

export default function Show({ course }) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-2 text-sm">
                    <Link href={route('dashboard')} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        Dashboard
                    </Link>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                    <span className="font-semibold text-gray-900 dark:text-white truncate max-w-[200px]">
                        {course.title}
                    </span>
                </div>
            }
        >
            <Head title={course.title} />

            <div className="space-y-8">
                {/* Hero Section */}
                <div className="relative rounded-2xl overflow-hidden bg-sidebar p-8 sm:p-12 text-white border border-white/5">
                    <div className="relative z-10 max-w-2xl">
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-[0.625rem] font-bold uppercase tracking-widest mb-6 border border-blue-500/30">
                            Course Curriculum
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
                            {course.title}
                        </h1>
                        <p className="text-blue-100/70 leading-relaxed mb-8">
                            {course.description}
                        </p>
                        <div className="flex items-center gap-6 text-sm text-blue-200/60 font-medium">
                            <div className="flex items-center gap-2">
                                <BookOpen className="w-4 h-4" />
                                {course.modules.length} Modules
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                Estimated 12h 30m
                            </div>
                        </div>
                    </div>
                    {/* Abstract background elements */}
                    <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none overflow-hidden">
                        <GraduationCap className="absolute -top-10 -right-10 w-64 h-64 rotate-12" />
                    </div>
                </div>

                {/* Modules List */}
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white px-1">Curriculum Modules</h2>
                    <div className="grid grid-cols-1 gap-4">
                        {course.modules.map((module, index) => (
                            <div 
                                key={module.id} 
                                className="bg-surface dark:bg-brand-surface rounded-xl border border-line dark:border-brand-border p-5 shadow-xs hover:border-accent/40 transition-all group"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-brand-dark border border-line dark:border-brand-border flex items-center justify-center shrink-0 font-bold text-accent group-hover:bg-accent group-hover:text-white transition-colors">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white mb-1 group-hover:text-accent-light transition-colors">
                                                {module.title}
                                            </h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                                                {module.description}
                                            </p>
                                            <div className="flex items-center gap-4 mt-3">
                                                <span className="text-[0.625rem] font-bold uppercase tracking-widest text-sidebar-ink">
                                                    {module.topics.length} Topics
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <Link 
                                        href={route('learner.modules.show', { course: course.id, module: module.id })}
                                        className="shrink-0 px-4 py-2 rounded-lg bg-gray-50 dark:bg-brand-dark text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-accent hover:text-white transition-all flex items-center gap-2"
                                    >
                                        View Module
                                        <ChevronRight className="w-3.5 h-3.5" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
