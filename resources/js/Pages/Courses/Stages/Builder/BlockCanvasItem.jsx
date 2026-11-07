import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Copy, Trash2, Eye, EyeOff } from 'lucide-react';
import BlockPreview from './blockRenderers';
import { BLOCK_TYPE_LABELS } from './registry';

/**
 * A single draggable/selectable component on the canvas surface.
 */
export default function BlockCanvasItem({
    block,
    selected,
    onSelect,
    onUpdate,
    onDuplicate,
    onDelete,
    onToggleVisibility,
    disabled = false,
}) {
    const [isEditing, setIsEditing] = React.useState(false);

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: `block:${block.id}`,
        data: { kind: 'block', blockId: block.id },
        disabled: disabled || isEditing,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
    };

    const handleDoubleClick = (e) => {
        if (disabled) return;
        e.stopPropagation();
        setIsEditing(true);
    };

    const handleBlur = () => {
        setIsEditing(false);
    };

    const handleContentChange = (newContent) => {
        onUpdate(block.id, { content: { ...block.content, ...newContent } });
    };

    const hidden = block.is_visible === false;

    return (
        <div
            ref={setNodeRef}
            style={style}
            data-block-id={block.id}
            onDoubleClick={handleDoubleClick}
            {...(!isEditing ? listeners : {})}
            {...attributes}
            onPointerDown={(event) => {
                if (disabled || isEditing) {
                    return;
                }
                // Prevent the canvas marquee from starting when interacting with a block.
                event.stopPropagation();
                onSelect(block.id, event);

                // Also trigger dnd-kit's listener if it exists
                if (!isEditing && listeners?.onPointerDown) {
                    listeners.onPointerDown(event);
                }
            }}
            className={`group relative rounded-lg border bg-white dark:bg-brand-surface p-3 transition ${
                selected
                    ? 'border-[#5B5FC7] ring-2 ring-[#5B5FC7]/60'
                    : 'border-[#E8E8EC] dark:border-brand-border hover:border-[#C7C9E8]'
            } ${hidden ? 'opacity-60' : ''} ${isEditing ? 'cursor-text' : 'cursor-default'}`}
        >
            <div className="absolute -top-3 right-2 z-10 flex items-center gap-0.5 rounded-md border border-[#E8E8EC] dark:border-brand-border bg-white dark:bg-brand-dark px-1 py-0.5 opacity-0 shadow-sm transition group-hover:opacity-100">
                <button
                    type="button"
                    className="cursor-grab rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 active:cursor-grabbing dark:hover:bg-brand-surface-raised/30 dark:hover:text-gray-200"
                    title="Drag component"
                >
                    <GripVertical className="h-3 w-3" />
                </button>
                <button
                    type="button"
                    onClick={() => onToggleVisibility(block.id)}
                    className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-brand-surface-raised/30 dark:hover:text-gray-200"
                    title={hidden ? 'Show component' : 'Hide component'}
                >
                    {hidden ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                </button>
                <button
                    type="button"
                    onClick={() => onDuplicate(block.id)}
                    className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-brand-surface-raised/30 dark:hover:text-gray-200"
                    title="Duplicate component"
                >
                    <Copy className="h-3 w-3" />
                </button>
                <button
                    type="button"
                    onClick={() => onDelete(block.id)}
                    className="rounded p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                    title="Delete component"
                >
                    <Trash2 className="h-3 w-3" />
                </button>
            </div>

            <span className="absolute -top-2.5 left-2 z-10 rounded bg-[#5B5FC7] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white opacity-0 transition group-hover:opacity-100">
                {BLOCK_TYPE_LABELS[block.block_type] || block.block_type}
            </span>

            <BlockPreview
                block={block}
                isEditing={isEditing}
                onContentChange={handleContentChange}
                onBlur={handleBlur}
            />
        </div>
    );
}
