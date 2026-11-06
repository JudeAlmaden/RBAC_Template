import { getLayoutSlots } from './registry';

/**
 * Finds where a block lives within the page draft structure.
 *
 * @returns {{ pageIndex: number, blockIndex: number, slot: string } | null}
 */
export function findBlockLocation(pages, blockId) {
    for (let pageIndex = 0; pageIndex < pages.length; pageIndex += 1) {
        const blockIndex = pages[pageIndex].blocks.findIndex((block) => block.id === blockId);
        if (blockIndex !== -1) {
            return { pageIndex, blockIndex, slot: pages[pageIndex].blocks[blockIndex].layout_slot };
        }
    }
    return null;
}

/**
 * Parses a droppable slot id of the form `slot:<pageId>:<slotKey>`.
 */
export function parseSlotId(id) {
    if (typeof id !== 'string' || !id.startsWith('slot:')) {
        return null;
    }
    const parts = id.split(':');
    return { pageId: parts[1], slot: parts[2] };
}

export function parseBlockId(id) {
    if (typeof id !== 'string' || !id.startsWith('block:')) {
        return null;
    }
    return id.slice('block:'.length);
}

export function parsePageId(id) {
    if (typeof id !== 'string' || !id.startsWith('page:')) {
        return null;
    }
    return id.slice('page:'.length);
}

/**
 * Removes a block from every page. Returns a new pages array.
 */
export function removeBlock(pages, blockId) {
    return pages.map((page) => ({
        ...page,
        blocks: page.blocks.filter((block) => block.id !== blockId),
    }));
}

/**
 * Inserts a block into a target page/slot, optionally before a given block.
 * When `beforeBlockId` is null the block is appended to the end of the slot.
 */
export function insertBlock(pages, pageId, slot, block, beforeBlockId = null) {
    return pages.map((page) => {
        if (String(page.id) !== String(pageId)) {
            return page;
        }

        const blocks = [...page.blocks];
        const newBlock = { ...block, layout_slot: slot };

        let insertAt = blocks.length;
        if (beforeBlockId != null) {
            const targetIndex = blocks.findIndex((item) => item.id === beforeBlockId);
            if (targetIndex !== -1) {
                insertAt = targetIndex;
            }
        } else {
            let lastInSlot = -1;
            blocks.forEach((item, index) => {
                if (item.layout_slot === slot) {
                    lastInSlot = index;
                }
            });
            insertAt = lastInSlot === -1 ? blocks.length : lastInSlot + 1;
        }

        blocks.splice(insertAt, 0, newBlock);
        return { ...page, blocks };
    });
}

/**
 * Moves an existing block to a target page/slot position.
 */
export function moveBlock(pages, blockId, targetPageId, targetSlot, beforeBlockId = null) {
    const location = findBlockLocation(pages, blockId);
    if (!location) {
        return pages;
    }

    if (beforeBlockId === blockId) {
        return pages;
    }

    const block = pages[location.pageIndex].blocks[location.blockIndex];
    return insertBlock(removeBlock(pages, blockId), targetPageId, targetSlot, block, beforeBlockId);
}

/**
 * Drops blocks that no longer belong to a page's layout (e.g. after a layout change).
 */
export function reconcileSlots(page) {
    const allowed = getLayoutSlots(page.layout_type).map((slot) => slot.key);
    const fallback = allowed[0] || 'main';

    return {
        ...page,
        blocks: page.blocks.map((block) =>
            allowed.includes(block.layout_slot) ? block : { ...block, layout_slot: fallback }
        ),
    };
}
