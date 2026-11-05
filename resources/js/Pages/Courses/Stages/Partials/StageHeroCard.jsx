import React from 'react';
import { Layers, Clock, Plus } from 'lucide-react';

export default function StageHeroCard({
    topic,
    onAddStage,
}) {
    const sectionsCount = topic.sections?.length || 0;
    const totalBlocks = (topic.sections || []).reduce(
        (sum, s) => sum + (s.blocks_count || 0),
        0
    );
    const totalActivities = (topic.sections || []).reduce(
        (sum, s) => sum + (s.activities_count || 0),
        0
    );

    return (
        <div className="bg-white dark:bg-[#15151A] rounded-xl border border-[#E8E8EC] dark:border-[#26262D] p-6 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-[#5B5FC7]/10 dark:bg-[#5B5FC7]/20 flex items-center justify-center shrink-0">
                        <Layers className="w-7 h-7 text-[#5B5FC7] dark:text-[#8A8DE2]" />
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                                {topic.title}
                            </h1>
                            <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                                    topic.is_published
                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                }`}
                            >
                                {topic.is_published ? 'Published' : 'Draft'}
                            </span>
                        </div>
                        {topic.description ? (
                            <p className="text-xs text-gray-600 dark:text-gray-400 max-w-3xl leading-relaxed">
                                {topic.description}
                            </p>
                        ) : (
                            <p className="text-xs italic text-gray-400 dark:text-gray-500">
                                No description provided for this topic.
                            </p>
                        )}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-2 text-[11px] text-gray-500 dark:text-gray-400">
                            <div>
                                Module:{' '}
                                <span className="font-medium text-gray-700 dark:text-gray-300">
                                    {topic.module?.title || '—'}
                                </span>
                            </div>
                            <span>•</span>
                            <div>
                                Course:{' '}
                                <span className="font-medium text-[#4A91CC]">
                                    {topic.course?.title || '—'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top Action Toolbar */}
                <div className="flex items-center gap-1.5 self-start shrink-0">
                    <button
                        onClick={onAddStage}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#4A91CC] hover:bg-[#347DBB] shadow-2xs transition"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Add Stage
                    </button>
                </div>
            </div>

            {/* Stats summary strip (matching Course and Module views) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-[#E8E8EC] dark:border-[#26262D]">
                <div className="p-3 rounded-lg bg-[#FAFAFC] dark:bg-[#1C1C24] border border-[#E8E8EC]/80 dark:border-[#26262D]">
                    <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Learning Stages</div>
                    <div className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
                        {sectionsCount}
                    </div>
                </div>
                <div className="p-3 rounded-lg bg-[#FAFAFC] dark:bg-[#1C1C24] border border-[#E8E8EC]/80 dark:border-[#26262D]">
                    <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Content Blocks</div>
                    <div className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
                        {totalBlocks}
                    </div>
                </div>
                <div className="p-3 rounded-lg bg-[#FAFAFC] dark:bg-[#1C1C24] border border-[#E8E8EC]/80 dark:border-[#26262D]">
                    <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Activities</div>
                    <div className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
                        {totalActivities}
                    </div>
                </div>
                <div className="p-3 rounded-lg bg-[#FAFAFC] dark:bg-[#1C1C24] border border-[#E8E8EC]/80 dark:border-[#26262D]">
                    <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Est. Duration</div>
                    <div className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
                        {topic.estimated_minutes ? `${topic.estimated_minutes}m` : '—'}
                    </div>
                </div>
            </div>
        </div>
    );
}
