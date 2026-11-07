import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import BlockCanvasItem from './BlockCanvasItem';
import { getLayoutSlots } from './registry';

/**
 * Static column-span classes (Tailwind cannot resolve dynamically built class names).
 */
const COL_SPAN_CLASS = {
    12: 'col-span-12',
    9: 'col-span-12 lg:col-span-9',
    7: 'col-span-12 lg:col-span-7',
    5: 'col-span-12 lg:col-span-5',
    3: 'col-span-12 lg:col-span-3',
};

function SlotZone({ page, slot, blocks, handlers, selectedIds, disabled }) {
    const { setNodeRef, isOver } = useDroppable({
        id: `slot:${page.id}:${slot.key}`,
        data: { kind: 'slot', pageId: page.id, slot: slot.key },
        disabled,
    });

    return (
        <div
            ref={setNodeRef}
            className={`flex min-h-[120px] flex-col gap-2.5 rounded-xl border p-3 transition ${
                isOver
                    ? 'border-[#5B5FC7] bg-[#5B5FC7]/5'
                    : 'border-[#E8E8EC] dark:border-brand-border bg-[#FAFAFC] dark:bg-[#101014]'
            }`}
        >
            <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                {slot.label}
            </span>

            <SortableContext
                items={blocks.map((block) => `block:${block.id}`)}
                strategy={verticalListSortingStrategy}
            >
                {blocks.map((block) => (
                    <BlockCanvasItem
                        key={block.id}
                        block={block}
                        selected={selectedIds.has(block.id)}
                        disabled={disabled}
                        {...handlers}
                    />
                ))}
            </SortableContext>

            {blocks.length === 0 && (
                <div className="flex flex-1 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-[#E8E8EC] dark:border-brand-border py-6 text-center">
                    <Plus className="h-4 w-4 text-gray-300 dark:text-gray-600" />
                    <span className="text-[10px] text-gray-400 dark:text-gray-500">
                        Drag a component here
                    </span>
                </div>
            )}
        </div>
    );
}

/**
 * Renders the active page's layout, distributing blocks into their slots.
 */
export default function LayoutRenderer({
    page,
    selectedIds,
    onSelect,
    onDuplicateBlock,
    onDeleteBlock,
    onUpdateBlock,
    onToggleBlockVisibility,
    disabled = false,
}) {
    const slots = getLayoutSlots(page.layout_type);

    const handlers = {
        onSelect,
        onUpdate: onUpdateBlock,
        onDuplicate: onDuplicateBlock,
        onDelete: onDeleteBlock,
        onToggleVisibility: onToggleBlockVisibility,
    };

    return (
        <div className="grid grid-cols-12 gap-4">
            {slots.map((slot) => (
                <div key={slot.key} className={COL_SPAN_CLASS[slot.weight] || 'col-span-12'}>
                    <SlotZone
                        page={page}
                        slot={slot}
                        blocks={page.blocks.filter((block) => block.layout_slot === slot.key)}
                        handlers={handlers}
                        selectedIds={selectedIds}
                        disabled={disabled}
                    />
                </div>
            ))}
        </div>
    );
}
