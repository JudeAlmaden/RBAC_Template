import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { BookOpen, Clock, ChevronRight, Play, ArrowLeft } from 'lucide-react';

export default function Show({ course, module }) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-2 text-sm">
                    <Link href={route('learner.courses.show', course.id)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        {course.title}
                    </Link>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                    <span className="font-semibold text-gray-900 dark:text-white truncate max-w-[200px]">
                        {module.title}
                    </span>
                </div>
            }
        >
            <Head title={`${module.title} - ${course.title}`} />

            <div className="space-y-8">
                {/* Module Header */}
                <div className="space-y-4">
                    <Link 
                        href={route('learner.courses.show', course.id)}
                        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-accent-light hover:underline"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Back to Course
                    </Link>
                    <div>
                        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
                            {module.title}
                        </h1>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-3xl leading-relaxed">
                            {module.description}
                        </p>
                    </div>
                </div>

                {/* Topics List */}
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white px-1">Module Topics</h2>
                    <div className="grid grid-cols-1 gap-3">
                        {module.topics.map((topic, index) => (
                            <Link 
                                key={topic.id}
                                href={route('learner.topics.show', { 
                                    course: course.id, 
                                    module: module.id, 
                                    topic: topic.id 
                                })}
                                className="bg-surface rounded-xl border border-line p-4 shadow-xs hover:border-accent/40 transition-all group flex items-center justify-between"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-raised flex items-center justify-center shrink-0 text-xs font-bold text-gray-400 group-hover:text-accent transition-colors">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-accent-light transition-colors">
                                            {topic.title}
                                        </h3>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="flex items-center gap-1 text-[0.625rem] text-gray-400">
                                                <Clock className="w-3 h-3" />
                                                {topic.estimated_minutes || 15} mins
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-raised flex items-center justify-center text-gray-400 group-hover:bg-accent group-hover:text-white transition-all">
                                    <Play className="w-3 h-3 fill-current" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
