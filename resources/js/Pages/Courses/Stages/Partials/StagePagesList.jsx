import React from 'react';
import {
    Layout,
    Plus,
    ChevronUp,
    ChevronDown,
    Boxes,
    Pencil,
    Trash2,
    Eye,
    EyeOff,
} from 'lucide-react';
import { LAYOUT_TYPE_DETAILS } from './StageFormModal';

export default function StagePagesList({
    pages = [],
    onAddPage,
    onEditPage,
    onDeletePage,
    onMovePage,
}) {
    return (
        <div className="bg-white dark:bg-[#15151A] rounded-xl border border-[#E8E8EC] dark:border-[#26262D] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span>Container Pages</span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-[#5B5FC7]/10 text-[#5B5FC7] dark:bg-[#5B5FC7]/20 dark:text-[#8A8DE2]">
                            {pages.length}
                        </span>
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        Each container defines a responsive layout holding content components for this stage.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={onAddPage}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#5B5FC7] hover:bg-[#484CB8] shadow-xs transition"
                >
                    <Plus className="w-3.5 h-3.5" />
                    Add Page
                </button>
            </div>

            {pages.length === 0 ? (
                <div className="rounded-lg border border-dashed border-[#E8E8EC] dark:border-[#26262D] p-8 text-center">
                    <Layout className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        No container pages in this stage yet
                    </p>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                        Add a container page to specify a layout and start adding components.
                    </p>
                    <button
                        type="button"
                        onClick={onAddPage}
                        className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/30 hover:bg-indigo-100 transition"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Create First Page
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {pages.map((page, idx) => {
                        const layoutInfo = LAYOUT_TYPE_DETAILS[page.layout_type] || {
                            label: page.layout_type,
                            desc: '',
                        };

                        return (
                            <div
                                key={page.id}
                                className="rounded-lg border border-[#E8E8EC] dark:border-[#26262D] bg-[#FAFAFC] dark:bg-[#1C1C24] p-4 space-y-3"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        {/* Reorder arrows */}
                                        <div className="flex flex-col gap-0.5 shrink-0">
                                            <button
                                                type="button"
                                                disabled={idx === 0}
                                                onClick={() => onMovePage(idx, 'up')}
                                                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-[#26262D] text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-20 transition"
                                                title="Move page up"
                                            >
                                                <ChevronUp className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                type="button"
                                                disabled={idx === pages.length - 1}
                                                onClick={() => onMovePage(idx, 'down')}
                                                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-[#26262D] text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-20 transition"
                                                title="Move page down"
                                            >
                                                <ChevronDown className="w-3.5 h-3.5" />
                                            </button>
                                        </div>

                                        <div className="w-6 h-6 rounded-md bg-[#5B5FC7]/10 dark:bg-[#5B5FC7]/20 flex items-center justify-center font-bold text-xs text-[#5B5FC7] dark:text-[#8A8DE2] shrink-0">
                                            {idx + 1}
                                        </div>

                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                                                    {page.title || `Page ${idx + 1}`}
                                                </h3>
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-700 dark:bg-[#26262D] dark:text-gray-300">
                                                    <Layout className="w-3 h-3 text-gray-400" />
                                                    {layoutInfo.label}
                                                </span>
                                                <span
                                                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold ${
                                                        page.is_visible
                                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                            : 'bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                                    }`}
                                                >
                                                    {page.is_visible ? (
                                                        <>
                                                            <Eye className="w-2.5 h-2.5" /> Visible
                                                        </>
                                                    ) : (
                                                        <>
                                                            <EyeOff className="w-2.5 h-2.5" /> Hidden
                                                        </>
                                                    )}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-3 text-[10px] text-gray-400 mt-1">
                                                <span className="flex items-center gap-1">
                                                    <Boxes className="w-3 h-3" />
                                                    {page.blocks_count || 0} Content Components
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex items-center gap-1 shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => onEditPage(page)}
                                            className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-[#26262D] transition"
                                            title="Edit Container Page"
                                        >
                                            <Pencil className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => onDeletePage(page)}
                                            className="p-1.5 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                                            title="Delete Page"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Components drop zone placeholder */}
                                <div className="rounded border border-dashed border-[#E8E8EC] dark:border-[#26262D] bg-white dark:bg-[#15151A] p-4 text-center">
                                    <p className="text-[11px] text-gray-400 dark:text-gray-500">
                                        {page.blocks_count > 0
                                            ? `${page.blocks_count} components configured in this ${layoutInfo.label} layout.`
                                            : `No components inside this ${layoutInfo.label} container yet. Component builder coming soon.`}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

