import React, { useState } from 'react';
import {
    Layers,
    Plus,
    Wand2,
    ChevronUp,
    ChevronDown,
    Layout,
    Boxes,
    CheckCircle2,
    Trash2,
    ChevronsUpDown,
} from 'lucide-react';
import { router } from '@inertiajs/react';
import { SECTION_TYPE_DETAILS, LAYOUT_TYPE_DETAILS } from './StageFormModal';

/**
 * Group consecutive sections that share the same section_type into runs.
 * Each group: { type, stages: [...], startIdx }
 * where startIdx is the original flat index of the first item in the group.
 */
function groupConsecutive(sections) {
    const groups = [];
    for (let i = 0; i < sections.length; i++) {
        const stage = sections[i];
        const last = groups[groups.length - 1];
        if (last && last.type === stage.section_type) {
            last.stages.push({ ...stage, flatIdx: i });
        } else {
            groups.push({ type: stage.section_type, stages: [{ ...stage, flatIdx: i }], startIdx: i });
        }
    }
    return groups;
}

function StageRow({ stage, flatIdx, totalSections, topic, onMove, onDelete, isGrouped }) {
    const details = SECTION_TYPE_DETAILS[stage.section_type] || {
        label: stage.section_type,
        badge: 'bg-gray-100 text-gray-700',
        desc: '',
    };

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={() => router.visit(route('topics.stages.show', [topic.id, stage.id]))}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    router.visit(route('topics.stages.show', [topic.id, stage.id]));
                }
            }}
            className={`bg-white dark:bg-[#15151A] rounded-xl border border-[#E8E8EC] dark:border-[#26262D] p-4 shadow-xs hover:border-[#5B5FC7]/40 hover:shadow-sm cursor-pointer transition ${isGrouped ? 'border-l-2 border-l-[#5B5FC7]/30' : ''}`}
        >
            <div className="flex items-start justify-between gap-4">
                {/* Left details */}
                <div className="flex items-start gap-3 min-w-0">
                    {/* Reorder buttons */}
                    <div className="flex flex-col gap-0.5 pt-0.5 shrink-0">
                        <button
                            type="button"
                            disabled={flatIdx === 0}
                            onClick={(e) => { e.stopPropagation(); onMove(flatIdx, 'up'); }}
                            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-[#26262D] text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-20 transition"
                            title="Move stage up"
                        >
                            <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                            type="button"
                            disabled={flatIdx === totalSections - 1}
                            onClick={(e) => { e.stopPropagation(); onMove(flatIdx, 'down'); }}
                            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-[#26262D] text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-20 transition"
                            title="Move stage down"
                        >
                            <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <div className="w-7 h-7 rounded-lg bg-[#5B5FC7]/10 dark:bg-[#5B5FC7]/20 flex items-center justify-center font-bold text-xs text-[#5B5FC7] dark:text-[#8A8DE2] shrink-0">
                        {flatIdx + 1}
                    </div>

                    <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                            {/* Only show type badge when NOT inside a grouped header (it's shown on the header itself) */}
                            {!isGrouped && (
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${details.badge}`}>
                                    {details.label}
                                </span>
                            )}
                            <span className="font-semibold text-xs text-gray-900 dark:text-white truncate">
                                {stage.title}
                            </span>
                            <span
                                className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold ${
                                    stage.is_published
                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                }`}
                            >
                                {stage.is_published ? 'Published' : 'Draft'}
                            </span>
                            {stage.is_required && (
                                <span className="text-[9px] font-semibold text-gray-400 dark:text-gray-500">
                                    (Required)
                                </span>
                            )}
                        </div>

                        {stage.instructions && (
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                                {stage.instructions}
                            </p>
                        )}

                        <div className="flex items-center gap-3 text-[10px] text-gray-400 pt-1">
                            <span className="flex items-center gap-1">
                                <Boxes className="w-3 h-3 text-gray-400" />
                                {stage.blocks_count || 0} Content Blocks
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-gray-400" />
                                {stage.activities_count || 0} Activities
                            </span>
                        </div>
                    </div>
                </div>

                {/* Action tools */}
                <div className="flex items-center gap-1.5 shrink-0">
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(stage); }}
                        className="p-1.5 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                        title="Delete Stage"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
}

function StageGroup({ group, totalSections, topic, onMove, onDelete }) {
    const [open, setOpen] = useState(true);
    const details = SECTION_TYPE_DETAILS[group.type] || {
        label: group.type,
        badge: 'bg-gray-100 text-gray-700',
        desc: '',
    };
    const isMulti = group.stages.length > 1;

    if (!isMulti) {
        return (
            <StageRow
                stage={group.stages[0]}
                flatIdx={group.stages[0].flatIdx}
                totalSections={totalSections}
                topic={topic}
                onMove={onMove}
                onDelete={onDelete}
                isGrouped={false}
            />
        );
    }

    return (
        <div className="rounded-xl border border-[#E8E8EC] dark:border-[#26262D] overflow-hidden shadow-xs">
            {/* Group header */}
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-[#FAFAFC] dark:bg-[#1C1C24] hover:bg-gray-100 dark:hover:bg-[#26262D] transition text-left"
            >
                <div className="flex items-center gap-2.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${details.badge}`}>
                        {details.label}
                    </span>
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                        {group.stages.length} parts
                    </span>
                    {details.desc && (
                        <span className="hidden sm:inline text-[11px] text-gray-400 dark:text-gray-500 truncate max-w-xs">
                            — {details.desc}
                        </span>
                    )}
                </div>
                <ChevronsUpDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {/* Group rows */}
            {open && (
                <div className="divide-y divide-[#E8E8EC] dark:divide-[#26262D] pl-4 bg-white dark:bg-[#15151A]">
                    {group.stages.map((stage) => (
                        <StageRow
                            key={stage.id}
                            stage={stage}
                            flatIdx={stage.flatIdx}
                            totalSections={totalSections}
                            topic={topic}
                            onMove={onMove}
                            onDelete={onDelete}
                            isGrouped={true}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function StagePipelineList({
    topic,
    onMove,
    onDelete,
    onAddStage,
    onApplyPreset,
}) {
    const sections = topic.sections || [];
    const groups = groupConsecutive(sections);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                        Pedagogical Learning Pipeline
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Sequence stages to guide the learner through active cognitive acquisition.
                    </p>
                </div>
            </div>

            {sections.length === 0 ? (
                <div className="bg-white dark:bg-[#15151A] rounded-xl border border-[#E8E8EC] dark:border-[#26262D] p-12 text-center">
                    <Layers className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                        No learning stages created yet
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto mt-1">
                        Create your first stage or use a pre-built pedagogical pipeline preset.
                    </p>
                    <div className="flex items-center justify-center gap-3 mt-4">
                        <button
                            onClick={() => onApplyPreset('standard_pedagogical')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/30 hover:bg-indigo-100 transition"
                        >
                            <Wand2 className="w-3.5 h-3.5" />
                            Generate Standard Flow
                        </button>
                        <button
                            onClick={onAddStage}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#5B5FC7] hover:bg-[#484CB8] shadow-xs transition"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            Add Stage Manually
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-3">
                    {groups.map((group, gi) => (
                        <StageGroup
                            key={`${group.type}-${group.startIdx}-${gi}`}
                            group={group}
                            totalSections={sections.length}
                            topic={topic}
                            onMove={onMove}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
