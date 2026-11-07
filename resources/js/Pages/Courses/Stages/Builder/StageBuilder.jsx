import React, { useEffect, useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import {
    DndContext,
    DragOverlay,
    PointerSensor,
    KeyboardSensor,
    closestCorners,
    useSensor,
    useSensors,
    defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import {
    Save,
    Eye,
    Undo2,
    Loader2,
    Layers,
    Boxes,
    SlidersHorizontal,
    MoreHorizontal,
    Trash2,
} from 'lucide-react';
import SlideRail from './SlideRail';
import BlockPalette from './BlockPalette';
import Canvas from './Canvas';
import Inspector from './Inspector';
import BlockPreview from './blockRenderers';
import { SECTION_TYPE_DETAILS } from '../Partials/StageFormModal';
import {
    createBlockFromPreset,
    normalizeBlocks,
    serializePages,
    tempId,
    BLOCK_TYPE_LABELS,
} from './registry';
import {
    insertBlock,
    moveBlock,
    parsePageId,
    findBlockLocation,
    reconcileSlots,
} from './operations';

function buildDraft(pages = []) {
    const normalized = pages.map((page) => ({
        id: page.id,
        title: page.title,
        layout_type: page.layout_type,
        is_visible: page.is_visible !== false,
        blocks: normalizeBlocks(page.blocks || []),
    }));

    if (normalized.length === 0) {
        normalized.push({
            id: tempId('page'),
            title: 'Page 1',
            layout_type: 'single_column',
            is_visible: true,
            blocks: [],
        });
    }

    return normalized;
}

function stageDraftFrom(stage) {
    return {
        title: stage.title || '',
        section_type: stage.section_type || 'custom',
        instructions: stage.instructions || '',
        is_required: stage.is_required !== false,
        is_published: Boolean(stage.is_published),
    };
}

/**
 * Single-page stage editor: the stage header, its slides, the canvas and the
 * inspector all live here and save through one action.
 */
export default function StageBuilder({ stage, topic, onDeleteStage }) {
    const [pages, setPages] = useState(() => buildDraft(stage.pages));
    const [stageDraft, setStageDraft] = useState(() => stageDraftFrom(stage));
    const [activePageId, setActivePageId] = useState(() => buildDraft(stage.pages)[0].id);
    const [selectedBlockIds, setSelectedBlockIds] = useState(() => new Set());
    const [dirty, setDirty] = useState(false);
    const [saving, setSaving] = useState(false);
    const [activeDrag, setActiveDrag] = useState(null);
    const [pane, setPane] = useState('pages');
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    const stageDirty = useMemo(
        () => JSON.stringify(stageDraft) !== JSON.stringify(stageDraftFrom(stage)),
        [stageDraft, stage]
    );
    const isDirty = dirty || stageDirty;

    // Preview opens the learner-facing stage page in its own tab.
    const previewHref =
        topic?.course?.id && topic?.module?.id
            ? `${route('learner.topics.show', [topic.course.id, topic.module.id, topic.id])}?stage=${stage.id}`
            : null;

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    // Re-sync the draft whenever persisted stage content changes (e.g. after save).
    useEffect(() => {
        if (dirty) {
            return;
        }
        const next = buildDraft(stage.pages);
        setPages(next);
        setActivePageId((current) =>
            next.some((page) => String(page.id) === String(current)) ? current : next[0].id
        );
        setSelectedBlockIds(new Set());
    }, [stage.pages, dirty]);

    useEffect(() => {
        if (stageDirty) {
            return;
        }
        setStageDraft(stageDraftFrom(stage));
    }, [stage, stageDirty]);

    const activePage = useMemo(
        () => pages.find((page) => String(page.id) === String(activePageId)) || pages[0],
        [pages, activePageId]
    );

    const selectedBlocks = useMemo(
        () => (activePage ? activePage.blocks.filter((block) => selectedBlockIds.has(block.id)) : []),
        [activePage, selectedBlockIds]
    );

    // The inspector is a drawer: it appears for a selection and can be pinned for slide/stage settings.
    const inspectorVisible = settingsOpen || selectedBlocks.length > 0;

    const totalBlocks = useMemo(
        () => pages.reduce((sum, page) => sum + page.blocks.length, 0),
        [pages]
    );

    const typeDetails = SECTION_TYPE_DETAILS[stageDraft.section_type] || {
        label: stageDraft.section_type,
        badge: 'bg-gray-100 text-gray-700 dark:bg-[#26262D] dark:text-gray-300',
    };

    const markDirty = () => setDirty(true);

    const updateActivePage = (updater) => {
        setPages((current) =>
            current.map((page) => (String(page.id) === String(activePage?.id) ? updater(page) : page))
        );
        markDirty();
    };

    const handleUpdatePage = (patch) => {
        updateActivePage((page) => reconcileSlots({ ...page, ...patch }));
    };

    const handleUpdateStage = (patch) => {
        setStageDraft((current) => ({ ...current, ...patch }));
    };

    const handleAddPage = () => {
        setPages((current) => {
            const next = [
                ...current,
                {
                    id: tempId('page'),
                    title: `Page ${current.length + 1}`,
                    layout_type: 'single_column',
                    is_visible: true,
                    blocks: [],
                },
            ];
            setActivePageId(next[next.length - 1].id);
            return next;
        });
        markDirty();
    };

    const handleDuplicatePage = (pageId) => {
        setPages((current) => {
            const index = current.findIndex((page) => String(page.id) === String(pageId));
            if (index === -1) {
                return current;
            }
            const source = current[index];
            const clone = {
                ...source,
                id: tempId('page'),
                title: `${source.title || `Page ${index + 1}`} copy`,
                blocks: source.blocks.map((block) => ({ ...block, id: tempId('blk') })),
            };
            const next = [...current];
            next.splice(index + 1, 0, clone);
            setActivePageId(clone.id);
            return next;
        });
        markDirty();
    };

    const handleDeletePage = (pageId) => {
        setPages((current) => {
            if (current.length === 1) {
                return current;
            }
            const next = current.filter((page) => String(page.id) !== String(pageId));
            setActivePageId((id) => (String(id) === String(pageId) ? next[0].id : id));
            return next;
        });
        setSelectedBlockIds(new Set());
        markDirty();
    };

    const handleSelectBlock = (blockId, event) => {
        if (blockId == null) {
            return;
        }
        const multi = event.shiftKey || event.metaKey || event.ctrlKey;
        setSelectedBlockIds((current) => {
            if (!multi) {
                return new Set([blockId]);
            }
            const next = new Set(current);
            if (next.has(blockId)) {
                next.delete(blockId);
            } else {
                next.add(blockId);
            }
            return next;
        });
    };

    const handleUpdateBlock = (blockId, patch) => {
        updateActivePage((page) => ({
            ...page,
            blocks: page.blocks.map((block) => (block.id === blockId ? { ...block, ...patch } : block)),
        }));
    };

    const handleDeleteBlock = (blockId) => {
        updateActivePage((page) => ({ ...page, blocks: page.blocks.filter((block) => block.id !== blockId) }));
        setSelectedBlockIds((current) => {
            const next = new Set(current);
            next.delete(blockId);
            return next;
        });
    };

    const handleToggleBlockVisibility = (blockId) => {
        updateActivePage((page) => ({
            ...page,
            blocks: page.blocks.map((block) =>
                block.id === blockId ? { ...block, is_visible: block.is_visible === false } : block
            ),
        }));
    };

    const handleDuplicateBlock = (blockId) => {
        updateActivePage((page) => {
            const index = page.blocks.findIndex((block) => block.id === blockId);
            if (index === -1) {
                return page;
            }
            const blocks = [...page.blocks];
            blocks.splice(index + 1, 0, { ...blocks[index], id: tempId('blk'), isNew: true });
            return { ...page, blocks };
        });
    };

    const handleDeleteSelected = () => {
        updateActivePage((page) => ({
            ...page,
            blocks: page.blocks.filter((block) => !selectedBlockIds.has(block.id)),
        }));
        setSelectedBlockIds(new Set());
    };

    const handleDuplicateSelected = () => {
        updateActivePage((page) => {
            const blocks = [];
            page.blocks.forEach((block) => {
                blocks.push(block);
                if (selectedBlockIds.has(block.id)) {
                    blocks.push({ ...block, id: tempId('blk'), isNew: true });
                }
            });
            return { ...page, blocks };
        });
        setSelectedBlockIds(new Set());
    };

    const handleMoveSelectedToSlot = (slot) => {
        updateActivePage((page) => ({
            ...page,
            blocks: page.blocks.map((block) =>
                selectedBlockIds.has(block.id) ? { ...block, layout_slot: slot } : block
            ),
        }));
    };

    // Palette click-to-add appends to the active page's default slot.
    const handlePaletteAdd = (preset) => {
        if (!activePage) {
            return;
        }
        const block = createBlockFromPreset(preset, activePage.layout_type);
        setPages((current) =>
            current.map((page) =>
                String(page.id) === String(activePage.id)
                    ? { ...page, blocks: [...page.blocks, block] }
                    : page
            )
        );
        setSelectedBlockIds(new Set([block.id]));
        markDirty();
    };

    const handleDragStart = (event) => {
        const data = event.active.data.current;
        if (!data) {
            return;
        }
        if (data.kind === 'palette') {
            setActiveDrag({ kind: 'palette', label: data.preset.label, Icon: data.preset.icon });
        } else if (data.kind === 'block') {
            const location = findBlockLocation(pages, data.blockId);
            const block = location ? pages[location.pageIndex].blocks[location.blockIndex] : null;
            setActiveDrag({
                kind: 'block',
                block,
                label: block ? BLOCK_TYPE_LABELS[block.block_type] || 'Component' : 'Component',
                Icon: Boxes,
            });
        } else if (data.kind === 'page') {
            setActiveDrag({ kind: 'page', label: 'Page', Icon: Layers });
        }
    };

    const resolveDropTarget = (overData) => {
        if (!overData) {
            return null;
        }
        if (overData.kind === 'slot') {
            return { pageId: overData.pageId, slot: overData.slot, beforeBlockId: null };
        }
        if (overData.kind === 'block') {
            const location = findBlockLocation(pages, overData.blockId);
            if (!location) {
                return null;
            }
            const page = pages[location.pageIndex];
            return {
                pageId: page.id,
                slot: page.blocks[location.blockIndex].layout_slot,
                beforeBlockId: overData.blockId,
            };
        }
        return null;
    };

    const handleDragEnd = (event) => {
        setActiveDrag(null);
        const { active, over } = event;
        if (!over) {
            return;
        }

        const activeData = active.data.current;

        if (activeData?.kind === 'page') {
            const overPageId = parsePageId(String(over.id));
            if (!overPageId) {
                return;
            }
            const from = pages.findIndex((page) => String(page.id) === parsePageId(String(active.id)));
            const to = pages.findIndex((page) => String(page.id) === overPageId);
            if (from !== -1 && to !== -1 && from !== to) {
                setPages(arrayMove(pages, from, to));
                markDirty();
            }
            return;
        }

        const target = resolveDropTarget(over.data.current);
        if (!target) {
            return;
        }

        if (activeData?.kind === 'palette') {
            const block = createBlockFromPreset(activeData.preset, activePage?.layout_type);
            setPages(insertBlock(pages, target.pageId, target.slot, block, target.beforeBlockId));
            setActivePageId(target.pageId);
            markDirty();
        } else if (activeData?.kind === 'block') {
            const activeId = activeData.blockId;
            const overData = over.data.current;

            if (overData?.kind === 'block') {
                const activeLoc = findBlockLocation(pages, activeId);
                const overLoc = findBlockLocation(pages, overData.blockId);

                if (activeLoc && overLoc &&
                    activeLoc.pageIndex === overLoc.pageIndex &&
                    activeLoc.slot === overLoc.slot) {

                    const pageIndex = activeLoc.pageIndex;
                    const oldIndex = activeLoc.blockIndex;
                    const newIndex = overLoc.blockIndex;

                    if (oldIndex !== newIndex) {
                        setPages(current => current.map((page, idx) => {
                            if (idx !== pageIndex) return page;
                            return {
                                ...page,
                                blocks: arrayMove(page.blocks, oldIndex, newIndex)
                            };
                        }));
                        markDirty();
                    }
                    return;
                }
            }

            const blockTarget = resolveDropTarget(over.data.current);
            if (blockTarget) {
                setPages(moveBlock(pages, activeId, blockTarget.pageId, blockTarget.slot, blockTarget.beforeBlockId));
                markDirty();
            }
        }
    };

    const handleSave = () => {
        setSaving(true);
        router.put(
            route('stages.builder.save', stage.id),
            { pages: serializePages(pages), stage: stageDraft },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => setDirty(false),
                onFinish: () => setSaving(false),
            }
        );
    };

    const handleDiscard = () => {
        const next = buildDraft(stage.pages);
        setPages(next);
        setActivePageId(next[0].id);
        setSelectedBlockIds(new Set());
        setStageDraft(stageDraftFrom(stage));
        setDirty(false);
    };

    // Keyboard layer: ⌘/Ctrl+S saves, Esc clears the selection, Delete removes it.
    useEffect(() => {
        const isEditableTarget = (target) =>
            target instanceof HTMLElement &&
            (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

        const handleKeyDown = (event) => {
            if (isEditableTarget(event.target)) {
                return;
            }

            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
                event.preventDefault();
                if (isDirty && !saving) {
                    handleSave();
                }
                return;
            }

            if (event.key === 'Escape') {
                if (selectedBlockIds.size > 0) {
                    setSelectedBlockIds(new Set());
                } else if (settingsOpen) {
                    setSettingsOpen(false);
                }
                return;
            }

            if ((event.key === 'Delete' || event.key === 'Backspace') && selectedBlockIds.size > 0) {
                event.preventDefault();
                handleDeleteSelected();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isDirty, saving, selectedBlockIds, settingsOpen, pages, stageDraft]);

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={() => setActiveDrag(null)}
        >
            <div className="overflow-hidden rounded-xl border border-[#E8E8EC] bg-white shadow-xs dark:border-brand-border dark:bg-brand-surface">
                {/* Stage header + actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E8E8EC] px-4 py-2.5 dark:border-brand-border">
                    <div className="flex min-w-0 items-center gap-3">
                        <span className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${typeDetails.badge}`}>
                            {typeDetails.label}
                        </span>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-gray-900 dark:text-white">
                                {stageDraft.title || 'Untitled stage'}
                            </p>
                            <p className="text-[10px] text-gray-400 dark:text-gray-500">
                                {pages.length} slide{pages.length === 1 ? '' : 's'} · {totalBlocks} component
                                {totalBlocks === 1 ? '' : 's'} · {stageDraft.is_required ? 'Required' : 'Optional'} ·{' '}
                                {stageDraft.is_published ? 'Published' : 'Draft'}
                                {topic?.title ? ` · ${topic.title}` : ''}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {isDirty && (
                            <span className="hidden items-center gap-1.5 text-[11px] font-medium text-amber-600 sm:flex dark:text-amber-400">
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                Unsaved changes
                            </span>
                        )}

                        <button
                            type="button"
                            onClick={() => setSettingsOpen((value) => !value)}
                            aria-pressed={settingsOpen}
                            title={settingsOpen ? 'Hide slide & stage settings' : 'Show slide & stage settings'}
                            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition ${
                                settingsOpen
                                    ? 'border-[#5B5FC7] bg-[#5B5FC7]/10 text-[#5B5FC7] dark:text-[#8A8DE2]'
                                    : 'border-[#E8E8EC] text-gray-700 hover:bg-gray-50 dark:border-brand-border dark:text-gray-200 dark:hover:bg-brand-dark'
                            }`}
                        >
                            <SlidersHorizontal className="h-3.5 w-3.5" />
                            Settings
                        </button>

                        <a
                            href={previewHref || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Open the learner view of this stage in a new tab"
                            className={`inline-flex items-center gap-1.5 rounded-lg border border-[#E8E8EC] px-2.5 py-1.5 text-[11px] font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-brand-border dark:text-gray-200 dark:hover:bg-brand-dark ${
                                previewHref ? '' : 'pointer-events-none opacity-40'
                            }`}
                        >
                            <Eye className="h-3.5 w-3.5" />
                            Preview
                        </a>

                        <button
                            type="button"
                            onClick={handleDiscard}
                            disabled={!isDirty || saving}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[#E8E8EC] px-2.5 py-1.5 text-[11px] font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-40 dark:border-brand-border dark:text-gray-200 dark:hover:bg-brand-dark"
                        >
                            <Undo2 className="h-3.5 w-3.5" />
                            Discard
                        </button>

                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={!isDirty || saving}
                            title="Save (⌘/Ctrl+S)"
                            className="inline-flex items-center gap-1.5 rounded-lg bg-[#5B5FC7] px-3 py-1.5 text-[11px] font-semibold text-white shadow-xs transition hover:bg-[#484CB8] disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                            {saving ? 'Saving…' : 'Save'}
                        </button>

                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setMenuOpen((open) => !open)}
                                className="inline-flex rounded-lg border border-[#E8E8EC] p-1.5 text-gray-500 transition hover:bg-gray-50 dark:border-brand-border dark:text-gray-300 dark:hover:bg-brand-dark"
                                title="Stage actions"
                                aria-label="Stage actions"
                            >
                                <MoreHorizontal className="h-4 w-4" />
                            </button>
                            {menuOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                                    <div className="absolute right-0 top-full z-50 mt-1 w-44 overflow-hidden rounded-lg border border-[#E8E8EC] bg-white p-1 shadow-lg dark:border-brand-border dark:bg-brand-surface">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setMenuOpen(false);
                                                onDeleteStage?.();
                                            }}
                                            className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-[11px] font-semibold text-red-600 transition hover:bg-red-50 dark:hover:bg-red-900/20"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                            Delete stage
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Workspace */}
                <div className="flex h-[calc(100dvh-14rem)] min-h-[520px]">
                    {/* Left pane */}
                    <aside className="flex w-60 shrink-0 flex-col border-r border-[#E8E8EC] dark:border-brand-border">
                        <div className="flex gap-1 border-b border-[#E8E8EC] p-2 dark:border-brand-border">
                            {[
                                { key: 'pages', label: 'Slides', Icon: Layers },
                                { key: 'components', label: 'Components', Icon: Boxes },
                            ].map(({ key, label, Icon }) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setPane(key)}
                                    className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-semibold transition ${
                                        pane === key
                                            ? 'bg-[#5B5FC7] text-white shadow-xs'
                                            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-brand-dark'
                                    }`}
                                >
                                    <Icon className="h-3.5 w-3.5" />
                                    {label}
                                </button>
                            ))}
                        </div>

                        <div className="min-h-0 flex-1 overflow-y-auto custom-scrollbar p-3">
                            {pane === 'pages' ? (
                                <SlideRail
                                    pages={pages}
                                    activePageId={activePage?.id}
                                    onSelect={setActivePageId}
                                    onAddPage={handleAddPage}
                                    onDuplicatePage={handleDuplicatePage}
                                    onDeletePage={handleDeletePage}
                                />
                            ) : (
                                <BlockPalette onAdd={handlePaletteAdd} />
                            )}
                        </div>
                    </aside>

                    {/* Center canvas */}
                    <main className="min-w-0 flex-1 overflow-y-auto bg-[#FAFAFC] p-6 dark:bg-[#101014] transition-all duration-300">
                        {activePage && (
                            <div className={`mx-auto transition-[max-width] duration-200 ${inspectorVisible ? 'max-w-4xl' : 'max-w-5xl'}`}>
                                <div className="mb-4 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                                            {activePage.title || 'Untitled slide'}
                                        </h3>
                                        <p className="text-[11px] text-gray-400 dark:text-gray-500">
                                            {activePage.blocks.length} component
                                            {activePage.blocks.length === 1 ? '' : 's'} · click to select, drag to reorder
                                        </p>
                                    </div>
                                </div>

                                <Canvas
                                    page={activePage}
                                    selectedIds={selectedBlockIds}
                                    onSelect={handleSelectBlock}
                                    onMarqueeSelect={(ids) => setSelectedBlockIds(new Set(ids))}
                                    onClearSelection={() => setSelectedBlockIds(new Set())}
                                    onDuplicateBlock={handleDuplicateBlock}
                                    onDeleteBlock={handleDeleteBlock}
                                    onUpdateBlock={handleUpdateBlock}
                                    onToggleBlockVisibility={handleToggleBlockVisibility}
                                />
                            </div>
                        )}
                    </main>

                    {/* Right inspector: opens on selection, or stays pinned for slide/stage settings */}
                    {inspectorVisible && (
                        <aside className="w-80 shrink-0 overflow-y-auto custom-scrollbar border-l border-[#E8E8EC] p-4 dark:border-brand-border">
                            {activePage && (
                                <Inspector
                                    page={activePage}
                                    selectedBlocks={selectedBlocks}
                                    stage={stageDraft}
                                    onUpdatePage={handleUpdatePage}
                                    onUpdateBlock={handleUpdateBlock}
                                    onUpdateStage={handleUpdateStage}
                                    onDeleteSelected={handleDeleteSelected}
                                    onDuplicateSelected={handleDuplicateSelected}
                                    onMoveSelectedToSlot={handleMoveSelectedToSlot}
                                />
                            )}
                        </aside>
                    )}
                </div>
            </div>

            <DragOverlay
                dropAnimation={{
                    sideEffects: defaultDropAnimationSideEffects({
                        styles: {
                            active: {
                                opacity: '0.4',
                            },
                        },
                    }),
                }}
            >
                {activeDrag && (
                    <div className="z-[100] cursor-grabbing select-none pointer-events-none">
                        {activeDrag.kind === 'block' && activeDrag.block ? (
                            <div className="w-64 rounded-lg border border-[#5B5FC7] bg-white p-3 shadow-xl dark:bg-brand-surface">
                                <span className="mb-2 block text-[9px] font-semibold uppercase tracking-wider text-[#5B5FC7]">
                                    {activeDrag.label}
                                </span>
                                <div className="opacity-80">
                                    <BlockPreview block={activeDrag.block} />
                                </div>
                            </div>
                        ) : (
                            <div className="inline-flex items-center gap-2 rounded-lg border border-[#5B5FC7] bg-white px-3 py-2 text-[11px] font-semibold text-[#5B5FC7] shadow-lg dark:bg-brand-dark dark:text-[#8A8DE2]">
                                {activeDrag.Icon && <activeDrag.Icon className="h-3.5 w-3.5" />}
                                {activeDrag.label}
                            </div>
                        )}
                    </div>
                )}
            </DragOverlay>
        </DndContext>
    );
}
