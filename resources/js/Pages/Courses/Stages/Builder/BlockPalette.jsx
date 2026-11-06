import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { BLOCK_LIBRARY } from './registry';

function PaletteItem({ preset, onAdd }) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: `palette:${preset.key}`,
        data: { kind: 'palette', preset },
    });

    const Icon = preset.icon;

    return (
        <button
            ref={setNodeRef}
            type="button"
            {...listeners}
            {...attributes}
            onClick={() => onAdd(preset)}
            title={`Add ${preset.label} — drag onto the canvas or click to append`}
            className={`group flex w-full items-center gap-2.5 rounded-lg border border-[#E8E8EC] dark:border-brand-border bg-white dark:bg-brand-dark px-2.5 py-2 text-left transition hover:border-[#5B5FC7] hover:bg-[#5B5FC7]/5 cursor-grab active:cursor-grabbing ${
                isDragging ? 'opacity-40' : ''
            }`}
        >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#5B5FC7]/10 dark:bg-[#5B5FC7]/20">
                <Icon className="h-3.5 w-3.5 text-[#5B5FC7] dark:text-[#8A8DE2]" />
            </span>
            <span className="min-w-0 truncate text-[11px] font-semibold text-gray-700 dark:text-gray-200">
                {preset.label}
            </span>
        </button>
    );
}

/**
 * The component library. Items are draggable onto canvas slots and
 * clickable to append into the page's default slot.
 */
export default function BlockPalette({ onAdd }) {
    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    Components
                </h3>
                <p className="mt-0.5 text-[10px] text-gray-400 dark:text-gray-500">
                    Drag onto the canvas, or click to add.
                </p>
            </div>

            {BLOCK_LIBRARY.map((group) => (
                <div key={group.group} className="space-y-1.5">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                        {group.group}
                    </p>
                    <div className="space-y-1.5">
                        {group.items.map((preset) => (
                            <PaletteItem key={preset.key} preset={preset} onAdd={onAdd} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
