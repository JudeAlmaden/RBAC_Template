import React from 'react';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus, Copy, Trash2, EyeOff, Layers } from 'lucide-react';
import { LAYOUT_TYPE_DETAILS } from '../Partials/StageFormModal';

function PageCard({ page, index, isActive, onSelect, onDuplicate, onDelete, disabled }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: `page:${page.id}`,
        data: { kind: 'page', pageId: page.id },
        disabled,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const layoutLabel = (LAYOUT_TYPE_DETAILS[page.layout_type] || {}).label || page.layout_type;

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group relative rounded-lg border bg-surface dark:bg-brand-dark p-2.5 transition ${
                isActive
                    ? 'border-accent ring-1 ring-accent'
                    : 'border-line dark:border-brand-border hover:border-accent-light'
            }`}
        >
            <div className="flex items-start gap-2">
                <button
                    type="button"
                    {...listeners}
                    {...attributes}
                    disabled={disabled}
                    className="mt-0.5 shrink-0 cursor-grab text-gray-300 hover:text-gray-500 active:cursor-grabbing disabled:cursor-default"
                    title="Drag to reorder page"
                >
                    <GripVertical className="h-3.5 w-3.5" />
                </button>

                <button type="button" onClick={() => onSelect(page.id)} className="min-w-0 flex-1 text-left">
                    <div className="flex items-center gap-1.5">
                        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded bg-accent/10 dark:bg-accent/20 text-[0.5625rem] font-bold text-accent-light">
                            {index + 1}
                        </span>
                        <span className="truncate text-[0.6875rem] font-semibold text-gray-800 dark:text-gray-100">
                            {page.title || `Page ${index + 1}`}
                        </span>
                        {!page.is_visible && <EyeOff className="h-3 w-3 shrink-0 text-gray-400" />}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-[0.625rem] text-gray-400 dark:text-gray-500">
                        <span className="truncate">{layoutLabel}</span>
                        <span className="flex items-center gap-0.5 shrink-0">
                            <Layers className="h-2.5 w-2.5" />
                            {page.blocks.length}
                        </span>
                    </div>
                </button>

                <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition group-hover:opacity-100">
                    <button
                        type="button"
                        onClick={() => onDuplicate(page.id)}
                        disabled={disabled}
                        className="rounded p-1 text-gray-400 hover:bg-raised hover:text-gray-700 dark:hover:bg-brand-surface-raised/30 dark:hover:text-gray-200 disabled:opacity-40"
                        title="Duplicate page"
                    >
                        <Copy className="h-3 w-3" />
                    </button>
                    <button
                        type="button"
                        onClick={() => onDelete(page.id)}
                        disabled={disabled}
                        className="rounded p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-40"
                        title="Delete page"
                    >
                        <Trash2 className="h-3 w-3" />
                    </button>
                </div>
            </div>
        </div>
    );
}

/**
 * Vertical rail of container pages (slides). Pages are drag-sortable.
 */
export default function SlideRail({
    pages = [],
    activePageId,
    onSelect,
    onAddPage,
    onDuplicatePage,
    onDeletePage,
    disabled = false,
}) {
    return (
        <div className="flex h-full flex-col gap-3">
            <div className="flex items-center justify-between">
                <h3 className="text-[0.6875rem] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    Pages
                </h3>
                <span className="rounded-full bg-accent/10 px-1.5 py-0.5 text-[0.625rem] font-semibold text-accent dark:bg-accent/20 dark:text-accent-light">
                    {pages.length}
                </span>
            </div>

            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-0.5">
                <SortableContext items={pages.map((page) => `page:${page.id}`)} strategy={verticalListSortingStrategy}>
                    {pages.map((page, index) => (
                        <PageCard
                            key={page.id}
                            page={page}
                            index={index}
                            isActive={String(page.id) === String(activePageId)}
                            onSelect={onSelect}
                            onDuplicate={onDuplicatePage}
                            onDelete={onDeletePage}
                            disabled={disabled}
                        />
                    ))}
                </SortableContext>

                {pages.length === 0 && (
                    <p className="rounded-lg border border-dashed border-line dark:border-brand-border p-4 text-center text-[0.625rem] text-gray-400">
                        No pages yet.
                    </p>
                )}
            </div>

            <button
                type="button"
                onClick={onAddPage}
                disabled={disabled}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-accent/40 bg-accent/5 px-3 py-2 text-[0.6875rem] font-semibold text-accent transition hover:bg-accent/10 disabled:opacity-50 dark:text-accent-light"
            >
                <Plus className="h-3.5 w-3.5" />
                Add Page
            </button>
        </div>
    );
}
