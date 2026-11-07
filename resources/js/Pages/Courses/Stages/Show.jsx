import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Breadcrumbs from '@/Components/Breadcrumbs';
import StageBuilder from './Builder/StageBuilder';

export default function StageShow({ topic, stage, prevStage, nextStage }) {
    const stagesIndexHref = route('topics.stages.index', topic.id);

    const handleDeleteStage = () => {
        if (!confirm(`Are you sure you want to delete stage "${stage.title}"?`)) return;

        router.delete(route('topics.stages.destroy', [topic.id, stage.id]), {
            onSuccess: () => router.visit(stagesIndexHref),
        });
    };

    return (
        <AuthenticatedLayout startCollapsed>
            <Head title={`${stage.title} — Nexus`} />

            <div className="space-y-4">
                {/* Breadcrumbs + stage navigation */}
                <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
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
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                        <Link
                            href={prevStage ? route('topics.stages.show', [topic.id, prevStage.id]) : '#'}
                            aria-disabled={!prevStage}
                            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                                prevStage
                                    ? 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-[#26262D]'
                                    : 'pointer-events-none cursor-not-allowed text-gray-300 dark:text-gray-600'
                            }`}
                        >
                            <ChevronLeft className="h-3.5 w-3.5" /> Prev
                        </Link>
                        <Link
                            href={nextStage ? route('topics.stages.show', [topic.id, nextStage.id]) : '#'}
                            aria-disabled={!nextStage}
                            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                                nextStage
                                    ? 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-[#26262D]'
                                    : 'pointer-events-none cursor-not-allowed text-gray-300 dark:text-gray-600'
                            }`}
                        >
                            Next <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                    </div>
                </div>

                <StageBuilder stage={stage} topic={topic} onDeleteStage={handleDeleteStage} />

                {/* Learning activities stay on the same page as the editor */}
                <details className="rounded-xl border border-[#E8E8EC] bg-white shadow-xs dark:border-brand-border dark:bg-brand-surface">
                    <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-xs font-bold text-gray-900 dark:text-white">
                        <span>Learning activities</span>
                        <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500">
                            {stage.activities_count || 0} linked
                        </span>
                    </summary>
                    <div className="border-t border-[#E8E8EC] px-4 py-4 text-center text-[11px] text-gray-400 dark:border-brand-border dark:text-gray-500">
                        {(stage.activities_count || 0) > 0
                            ? `${stage.activities_count} activities linked to this stage.`
                            : 'No activities yet. The activity builder will live here.'}
                    </div>
                </details>
            </div>
        </AuthenticatedLayout>
    );
}
