import React, { useCallback, useRef, useState } from 'react';
import LayoutRenderer from './LayoutRenderer';

/**
 * The editing surface: renders the active page layout and implements
 * drag-select (marquee) multi-selection over the components.
 */
export default function Canvas({
    page,
    selectedIds,
    onSelect,
    onMarqueeSelect,
    onClearSelection,
    onDuplicateBlock,
    onDeleteBlock,
    onUpdateBlock,
    onToggleBlockVisibility,
    preview = false,
    disabled = false,
}) {
    const surfaceRef = useRef(null);
    const dragStartRef = useRef(null);
    const [marquee, setMarquee] = useState(null);

    const collectIntersecting = useCallback(
        (rect) => {
            const surface = surfaceRef.current;
            if (!surface) {
                return [];
            }

            const left = Math.min(rect.x1, rect.x2);
            const right = Math.max(rect.x1, rect.x2);
            const top = Math.min(rect.y1, rect.y2);
            const bottom = Math.max(rect.y1, rect.y2);

            const ids = [];
            surface.querySelectorAll('[data-block-id]').forEach((element) => {
                const bounds = element.getBoundingClientRect();
                const intersects =
                    bounds.left < right && bounds.right > left && bounds.top < bottom && bounds.bottom > top;
                if (!intersects) {
                    return;
                }
                const block = page.blocks.find((item) => String(item.id) === element.dataset.blockId);
                if (block) {
                    ids.push(block.id);
                }
            });

            return ids;
        },
        [page.blocks]
    );

    const handlePointerDown = (event) => {
        if (preview || disabled || event.button !== 0) {
            return;
        }

        dragStartRef.current = { x: event.clientX, y: event.clientY };
        setMarquee({ x1: event.clientX, y1: event.clientY, x2: event.clientX, y2: event.clientY });
        onClearSelection();
    };

    const handlePointerMove = (event) => {
        if (!dragStartRef.current) {
            return;
        }

        const rect = { x1: dragStartRef.current.x, y1: dragStartRef.current.y, x2: event.clientX, y2: event.clientY };
        setMarquee(rect);
        onMarqueeSelect(collectIntersecting(rect));
    };

    const endMarquee = () => {
        dragStartRef.current = null;
        setMarquee(null);
    };

    const marqueeStyle = marquee
        ? {
              left: Math.min(marquee.x1, marquee.x2),
              top: Math.min(marquee.y1, marquee.y2),
              width: Math.abs(marquee.x2 - marquee.x1),
              height: Math.abs(marquee.y2 - marquee.y1),
          }
        : null;

    return (
        <>
            <div
                ref={surfaceRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={endMarquee}
                onPointerLeave={endMarquee}
                className="min-h-[320px] space-y-4"
            >
                <LayoutRenderer
                    page={page}
                    selectedIds={selectedIds}
                    onSelect={onSelect}
                    onDuplicateBlock={onDuplicateBlock}
                    onDeleteBlock={onDeleteBlock}
                    onUpdateBlock={onUpdateBlock}
                    onToggleBlockVisibility={onToggleBlockVisibility}
                    preview={preview}
                    disabled={disabled}
                />
            </div>

            {marqueeStyle && (
                <div
                    className="pointer-events-none fixed z-50 rounded-sm border border-[#5B5FC7] bg-[#5B5FC7]/10"
                    style={marqueeStyle}
                />
            )}
        </>
    );
}
