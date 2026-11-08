import React, { useState } from 'react';
import { Trash2, Copy, Layout, Eye, EyeOff } from 'lucide-react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import BlockContentEditor from './blockEditors';
import { LAYOUT_TYPE_DETAILS, SECTION_TYPE_DETAILS } from '../Partials/StageFormModal';
import { BLOCK_TYPE_LABELS, VARIANTS_BY_TYPE, variantLabel, getLayoutSlots } from './registry';

const selectClass =
    'mt-1 block w-full rounded-md border-gray-300 dark:border-brand-border dark:bg-brand-dark dark:text-white shadow-xs focus:border-accent focus:ring-accent text-xs';

const textareaClass =
    'mt-1 block w-full rounded-md border-gray-300 dark:border-brand-border dark:bg-brand-dark dark:text-white shadow-xs focus:border-accent focus:ring-accent text-xs';

function Section({ title, children }) {
    return (
        <div className="space-y-3">
            <h4 className="text-[0.625rem] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">{title}</h4>
            {children}
        </div>
    );
}

/**
 * Right-hand inspector. Shows slide settings, stage settings, single-block
 * editing, or group operations based on the current selection.
 */
export default function Inspector({
    page,
    selectedBlocks,
    stage,
    onUpdatePage,
    onUpdateBlock,
    onUpdateStage,
    onDeleteSelected,
    onDuplicateSelected,
    onMoveSelectedToSlot,
}) {
    const [panel, setPanel] = useState('slide');
    const slots = getLayoutSlots(page.layout_type);
    const selectionCount = selectedBlocks.length;
    const activePanel = selectionCount > 0 ? 'component' : panel;

    return (
        <div className="flex h-full flex-col">
            <div className="flex items-center justify-between pb-3">
                <h3 className="text-[0.6875rem] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    Inspector
                </h3>
                {selectionCount > 0 && (
                    <span className="rounded-full bg-accent/10 px-1.5 py-0.5 text-[0.625rem] font-semibold text-accent dark:bg-accent/20 dark:text-accent-light">
                        {selectionCount} selected
                    </span>
                )}
            </div>

            {selectionCount === 0 && (
                <div className="mb-4 flex gap-1 rounded-lg bg-gray-100 p-1 dark:bg-brand-dark">
                    {[
                        { key: 'slide', label: 'Slide' },
                        { key: 'stage', label: 'Stage' },
                    ].map(({ key, label }) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => setPanel(key)}
                            className={`inline-flex flex-1 items-center justify-center rounded-md px-2 py-1.5 text-[0.6875rem] font-semibold transition ${
                                activePanel === key
                                    ? 'bg-surface text-gray-900 shadow-xs dark:bg-brand-surface dark:text-white'
                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            )}

            <div className="min-h-0 flex-1 space-y-6 overflow-y-auto custom-scrollbar pr-0.5">
                {activePanel === 'slide' && (
                    <>
                        <Section title="Slide">
                            <div>
                                <InputLabel value="Slide title" className="text-xs font-semibold" />
                                <TextInput
                                    value={page.title || ''}
                                    onChange={(event) => onUpdatePage({ title: event.target.value })}
                                    className="mt-1 block w-full text-xs"
                                />
                            </div>

                            <div>
                                <InputLabel value="Layout" className="text-xs font-semibold" />
                                <select
                                    value={page.layout_type}
                                    onChange={(event) => onUpdatePage({ layout_type: event.target.value })}
                                    className={selectClass}
                                >
                                    {Object.entries(LAYOUT_TYPE_DETAILS).map(([key, details]) => (
                                        <option key={key} value={key}>
                                            {details.label}
                                        </option>
                                    ))}
                                </select>
                                <p className="mt-1 text-[0.625rem] text-gray-400 dark:text-gray-500">
                                    {slots.length} slot{slots.length > 1 ? 's' : ''}: {slots.map((slot) => slot.label).join(', ')}
                                </p>
                            </div>

                            <label className="flex cursor-pointer items-center gap-2.5">
                                <input
                                    type="checkbox"
                                    checked={page.is_visible !== false}
                                    onChange={(event) => onUpdatePage({ is_visible: event.target.checked })}
                                    className="rounded border-gray-300 text-accent shadow-xs focus:ring-accent dark:border-brand-border"
                                />
                                <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                                    Slide visible to learners
                                </span>
                            </label>
                        </Section>

                        <Section title="Slide summary">
                            <div className="grid grid-cols-2 gap-2">
                                <div className="rounded-lg border border-line dark:border-brand-border p-2.5">
                                    <p className="text-[0.625rem] text-gray-400">Components</p>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{page.blocks.length}</p>
                                </div>
                                <div className="rounded-lg border border-line dark:border-brand-border p-2.5">
                                    <p className="text-[0.625rem] text-gray-400 flex items-center gap-1">
                                        <Layout className="h-3 w-3" /> Layout
                                    </p>
                                    <p className="truncate text-xs font-bold text-gray-900 dark:text-white">
                                        {(LAYOUT_TYPE_DETAILS[page.layout_type] || {}).label || page.layout_type}
                                    </p>
                                </div>
                            </div>
                        </Section>
                    </>
                )}

                {activePanel === 'stage' && stage && (
                    <>
                        <Section title="Stage">
                            <div>
                                <InputLabel value="Stage title" className="text-xs font-semibold" />
                                <TextInput
                                    value={stage.title || ''}
                                    onChange={(event) => onUpdateStage({ title: event.target.value })}
                                    className="mt-1 block w-full text-xs"
                                />
                            </div>

                            <div>
                                <InputLabel value="Stage type" className="text-xs font-semibold" />
                                <select
                                    value={stage.section_type}
                                    onChange={(event) => onUpdateStage({ section_type: event.target.value })}
                                    className={selectClass}
                                >
                                    {Object.entries(SECTION_TYPE_DETAILS).map(([key, details]) => (
                                        <option key={key} value={key}>
                                            {details.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <InputLabel value="Instructions" className="text-xs font-semibold" />
                                <textarea
                                    rows={4}
                                    value={stage.instructions || ''}
                                    onChange={(event) => onUpdateStage({ instructions: event.target.value })}
                                    placeholder="Reviewed in the lab environment…"
                                    className={textareaClass}
                                />
                            </div>

                            <label className="flex cursor-pointer items-center gap-2.5">
                                <input
                                    type="checkbox"
                                    checked={stage.is_required !== false}
                                    onChange={(event) => onUpdateStage({ is_required: event.target.checked })}
                                    className="rounded border-gray-300 text-accent shadow-xs focus:ring-accent dark:border-brand-border"
                                />
                                <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                                    Required to complete the topic
                                </span>
                            </label>

                            <label className="flex cursor-pointer items-center gap-2.5">
                                <input
                                    type="checkbox"
                                    checked={Boolean(stage.is_published)}
                                    onChange={(event) => onUpdateStage({ is_published: event.target.checked })}
                                    className="rounded border-gray-300 text-accent shadow-xs focus:ring-accent dark:border-brand-border"
                                />
                                <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                                    Published to learners
                                </span>
                            </label>
                        </Section>

                        <p className="text-[0.625rem] text-gray-400 dark:text-gray-500">
                            Stage settings save with the same Save action as the slides.
                        </p>
                    </>
                )}

                {selectionCount === 1 && (
                    <>
                        <Section title={BLOCK_TYPE_LABELS[selectedBlocks[0].block_type] || 'Component'}>
                            <div>
                                <InputLabel value="Variant" className="text-xs font-semibold" />
                                <select
                                    value={selectedBlocks[0].display_variant}
                                    onChange={(event) =>
                                        onUpdateBlock(selectedBlocks[0].id, { display_variant: event.target.value })
                                    }
                                    className={selectClass}
                                >
                                    {(VARIANTS_BY_TYPE[selectedBlocks[0].block_type] || ['default']).map((variant) => (
                                        <option key={variant} value={variant}>
                                            {variantLabel(variant)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <InputLabel value="Slot" className="text-xs font-semibold" />
                                <select
                                    value={selectedBlocks[0].layout_slot}
                                    onChange={(event) =>
                                        onUpdateBlock(selectedBlocks[0].id, { layout_slot: event.target.value })
                                    }
                                    className={selectClass}
                                >
                                    {slots.map((slot) => (
                                        <option key={slot.key} value={slot.key}>
                                            {slot.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <label className="flex cursor-pointer items-center gap-2.5">
                                <input
                                    type="checkbox"
                                    checked={selectedBlocks[0].is_visible !== false}
                                    onChange={(event) =>
                                        onUpdateBlock(selectedBlocks[0].id, { is_visible: event.target.checked })
                                    }
                                    className="rounded border-gray-300 text-accent shadow-xs focus:ring-accent dark:border-brand-border"
                                />
                                <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-200">
                                    {selectedBlocks[0].is_visible !== false ? (
                                        <Eye className="h-3.5 w-3.5" />
                                    ) : (
                                        <EyeOff className="h-3.5 w-3.5" />
                                    )}
                                    Visible
                                </span>
                            </label>
                        </Section>

                        <Section title="Content">
                            <BlockContentEditor
                                block={selectedBlocks[0]}
                                onChange={(content) => onUpdateBlock(selectedBlocks[0].id, { content })}
                            />
                        </Section>

                        <div className="flex items-center gap-2 border-t border-line pt-4 dark:border-brand-border">
                            <button
                                type="button"
                                onClick={onDuplicateSelected}
                                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-line px-3 py-2 text-[0.6875rem] font-semibold text-gray-700 transition hover:bg-raised dark:border-brand-border dark:text-gray-200 dark:hover:bg-brand-dark"
                            >
                                <Copy className="h-3.5 w-3.5" /> Duplicate
                            </button>
                            <button
                                type="button"
                                onClick={onDeleteSelected}
                                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-[0.6875rem] font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-900/20"
                            >
                                <Trash2 className="h-3.5 w-3.5" /> Delete
                            </button>
                        </div>
                    </>
                )}

                {selectionCount > 1 && (
                    <Section title={`${selectionCount} components selected`}>
                        <div>
                            <InputLabel value="Move all to slot" className="text-xs font-semibold" />
                            <select
                                value=""
                                onChange={(event) => {
                                    if (event.target.value) {
                                        onMoveSelectedToSlot(event.target.value);
                                    }
                                }}
                                className={selectClass}
                            >
                                <option value="">Choose slot…</option>
                                {slots.map((slot) => (
                                    <option key={slot.key} value={slot.key}>
                                        {slot.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                            <button
                                type="button"
                                onClick={onDuplicateSelected}
                                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-line px-3 py-2 text-[0.6875rem] font-semibold text-gray-700 transition hover:bg-raised dark:border-brand-border dark:text-gray-200 dark:hover:bg-brand-dark"
                            >
                                <Copy className="h-3.5 w-3.5" /> Duplicate all
                            </button>
                            <button
                                type="button"
                                onClick={onDeleteSelected}
                                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-[0.6875rem] font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-900/20"
                            >
                                <Trash2 className="h-3.5 w-3.5" /> Delete all
                            </button>
                        </div>
                    </Section>
                )}
            </div>
        </div>
    );
}
