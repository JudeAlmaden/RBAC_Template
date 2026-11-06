import React from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';

const fieldClass =
    'mt-1 block w-full rounded-md border-gray-300 dark:border-brand-border dark:bg-brand-dark dark:text-white shadow-xs focus:border-[#5B5FC7] focus:ring-[#5B5FC7] text-xs';

function Field({ label, children }) {
    return (
        <div>
            <InputLabel value={label} className="text-xs font-semibold" />
            {children}
        </div>
    );
}

function StringListEditor({ label, items = [], onChange, placeholder = 'Add item' }) {
    const update = (index, value) => {
        const next = [...items];
        next[index] = value;
        onChange(next);
    };

    const remove = (index) => onChange(items.filter((_, i) => i !== index));

    const add = () => onChange([...items, '']);

    return (
        <Field label={label}>
            <div className="mt-1 space-y-2">
                {items.map((item, index) => (
                    <div key={index} className="flex items-center gap-1.5">
                        <GripVertical className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 shrink-0" />
                        <TextInput
                            value={item}
                            onChange={(e) => update(index, e.target.value)}
                            placeholder={placeholder}
                            className="block w-full text-xs"
                        />
                        <button
                            type="button"
                            onClick={() => remove(index)}
                            className="p-1.5 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 shrink-0"
                            title="Remove item"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                ))}
                <button
                    type="button"
                    onClick={add}
                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#5B5FC7] dark:text-[#8A8DE2] hover:underline"
                >
                    <Plus className="w-3.5 h-3.5" />
                    Add item
                </button>
            </div>
        </Field>
    );
}

function PairListEditor({ label, items = [], onChange, titlePlaceholder = 'Title' }) {
    const update = (index, key, value) => {
        const next = items.map((item, i) => (i === index ? { ...item, [key]: value } : item));
        onChange(next);
    };

    const remove = (index) => onChange(items.filter((_, i) => i !== index));

    const add = () => onChange([...items, { title: '', text: '' }]);

    return (
        <Field label={label}>
            <div className="mt-1 space-y-2">
                {items.map((item, index) => (
                    <div
                        key={index}
                        className="rounded-lg border border-[#E8E8EC] dark:border-brand-border p-2.5 space-y-2"
                    >
                        <div className="flex items-center gap-1.5">
                            <TextInput
                                value={item.title || ''}
                                onChange={(e) => update(index, 'title', e.target.value)}
                                placeholder={titlePlaceholder}
                                className="block w-full text-xs"
                            />
                            <button
                                type="button"
                                onClick={() => remove(index)}
                                className="p-1.5 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 shrink-0"
                                title="Remove"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                        <textarea
                            rows={2}
                            value={item.text || ''}
                            onChange={(e) => update(index, 'text', e.target.value)}
                            placeholder="Content"
                            className={fieldClass}
                        />
                    </div>
                ))}
                <button
                    type="button"
                    onClick={add}
                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#5B5FC7] dark:text-[#8A8DE2] hover:underline"
                >
                    <Plus className="w-3.5 h-3.5" />
                    Add panel
                </button>
            </div>
        </Field>
    );
}

function TableEditor({ headers = [], rows = [], onChange }) {
    const setHeaders = (nextHeaders) => onChange({ headers: nextHeaders, rows });

    const updateHeader = (index, value) => {
        const next = [...headers];
        next[index] = value;
        setHeaders(next);
    };

    const addColumn = () => onChange({ headers: [...headers, `Column ${headers.length + 1}`], rows: rows.map((row) => [...row, '']) });

    const removeColumn = (index) =>
        onChange({
            headers: headers.filter((_, i) => i !== index),
            rows: rows.map((row) => row.filter((_, i) => i !== index)),
        });

    const updateCell = (rowIndex, cellIndex, value) => {
        const nextRows = rows.map((row, r) => (r === rowIndex ? row.map((cell, c) => (c === cellIndex ? value : cell)) : row));
        onChange({ headers, rows: nextRows });
    };

    const addRow = () => onChange({ headers, rows: [...rows, headers.map(() => '')] });
    const removeRow = (index) => onChange({ headers, rows: rows.filter((_, i) => i !== index) });

    return (
        <Field label="Table">
            <div className="mt-1 space-y-2">
                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead>
                            <tr>
                                {headers.map((header, index) => (
                                    <th key={index} className="p-0.5">
                                        <div className="flex items-center">
                                            <TextInput
                                                value={header}
                                                onChange={(e) => updateHeader(index, e.target.value)}
                                                className="block w-full text-xs font-semibold"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeColumn(index)}
                                                className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                                title="Remove column"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </th>
                                ))}
                                <th className="w-6" />
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                    {row.map((cell, cellIndex) => (
                                        <td key={cellIndex} className="p-0.5">
                                            <TextInput
                                                value={cell}
                                                onChange={(e) => updateCell(rowIndex, cellIndex, e.target.value)}
                                                className="block w-full text-xs"
                                            />
                                        </td>
                                    ))}
                                    <td className="p-0.5">
                                        <button
                                            type="button"
                                            onClick={() => removeRow(rowIndex)}
                                            className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                            title="Remove row"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={addRow}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#5B5FC7] dark:text-[#8A8DE2] hover:underline"
                    >
                        <Plus className="w-3 h-3" /> Add row
                    </button>
                    <button
                        type="button"
                        onClick={addColumn}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#5B5FC7] dark:text-[#8A8DE2] hover:underline"
                    >
                        <Plus className="w-3 h-3" /> Add column
                    </button>
                </div>
            </div>
        </Field>
    );
}

/**
 * Renders the content fields for the currently selected block.
 * `onChange` receives the full next content object.
 */
export default function BlockContentEditor({ block, onChange }) {
    const content = block.content || {};
    const set = (key, value) => onChange({ ...content, [key]: value });
    const variant = block.display_variant;

    switch (block.block_type) {
        case 'rich_text':
            if (variant === 'heading') {
                return (
                    <div className="space-y-4">
                        <Field label="Heading text">
                            <TextInput
                                value={content.text || ''}
                                onChange={(e) => set('text', e.target.value)}
                                className="mt-1 block w-full text-xs"
                            />
                        </Field>
                        <Field label="Level">
                            <select
                                value={content.level || 2}
                                onChange={(e) => set('level', Number(e.target.value))}
                                className={fieldClass}
                            >
                                <option value={2}>H2 — Section</option>
                                <option value={3}>H3 — Subsection</option>
                                <option value={4}>H4 — Minor</option>
                            </select>
                        </Field>
                    </div>
                );
            }
            if (['objectives', 'checklist', 'steps'].includes(variant)) {
                return (
                    <div className="space-y-4">
                        <Field label="Title">
                            <TextInput
                                value={content.title || ''}
                                onChange={(e) => set('title', e.target.value)}
                                className="mt-1 block w-full text-xs"
                            />
                        </Field>
                        <StringListEditor label="Items" items={content.items || []} onChange={(items) => set('items', items)} />
                    </div>
                );
            }
            if (variant === 'table') {
                return (
                    <TableEditor
                        headers={content.headers || []}
                        rows={content.rows || []}
                        onChange={(next) => onChange({ ...content, ...next })}
                    />
                );
            }
            if (variant === 'divider') {
                return <p className="text-[11px] text-gray-400 dark:text-gray-500">No options for a divider.</p>;
            }
            return (
                <Field label="Text">
                    <textarea
                        rows={6}
                        value={content.text || ''}
                        onChange={(e) => set('text', e.target.value)}
                        className={fieldClass}
                    />
                </Field>
            );

        case 'callout':
            if (variant === 'accordion') {
                return (
                    <PairListEditor
                        label="Panels"
                        items={content.items || []}
                        onChange={(items) => set('items', items)}
                        titlePlaceholder="Panel title"
                    />
                );
            }
            return (
                <div className="space-y-4">
                    <Field label="Tone">
                        <select value={content.tone || 'info'} onChange={(e) => set('tone', e.target.value)} className={fieldClass}>
                            <option value="info">Info</option>
                            <option value="tip">Tip</option>
                            <option value="warning">Warning</option>
                            <option value="danger">Danger</option>
                            <option value="success">Success</option>
                        </select>
                    </Field>
                    <Field label="Title">
                        <TextInput
                            value={content.title || ''}
                            onChange={(e) => set('title', e.target.value)}
                            className="mt-1 block w-full text-xs"
                        />
                    </Field>
                    <Field label="Text">
                        <textarea
                            rows={3}
                            value={content.text || ''}
                            onChange={(e) => set('text', e.target.value)}
                            className={fieldClass}
                        />
                    </Field>
                </div>
            );

        case 'video':
            return (
                <div className="space-y-4">
                    <Field label="Title">
                        <TextInput
                            value={content.title || ''}
                            onChange={(e) => set('title', e.target.value)}
                            className="mt-1 block w-full text-xs"
                        />
                    </Field>
                    <Field label="Embed URL">
                        <TextInput
                            value={content.url || ''}
                            onChange={(e) => set('url', e.target.value)}
                            placeholder="https://www.youtube.com/embed/…"
                            className="mt-1 block w-full text-xs"
                        />
                    </Field>
                    <Field label="Caption">
                        <TextInput
                            value={content.caption || ''}
                            onChange={(e) => set('caption', e.target.value)}
                            className="mt-1 block w-full text-xs"
                        />
                    </Field>
                </div>
            );

        case 'audio':
            return (
                <div className="space-y-4">
                    <Field label="Title">
                        <TextInput
                            value={content.title || ''}
                            onChange={(e) => set('title', e.target.value)}
                            className="mt-1 block w-full text-xs"
                        />
                    </Field>
                    <Field label="Audio URL">
                        <TextInput
                            value={content.url || ''}
                            onChange={(e) => set('url', e.target.value)}
                            className="mt-1 block w-full text-xs"
                        />
                    </Field>
                </div>
            );

        case 'embed':
            return (
                <div className="space-y-4">
                    <Field label="URL">
                        <TextInput
                            value={content.url || ''}
                            onChange={(e) => set('url', e.target.value)}
                            className="mt-1 block w-full text-xs"
                        />
                    </Field>
                    <Field label="Alt text">
                        <TextInput
                            value={content.alt || ''}
                            onChange={(e) => set('alt', e.target.value)}
                            className="mt-1 block w-full text-xs"
                        />
                    </Field>
                    <Field label="Caption">
                        <TextInput
                            value={content.caption || ''}
                            onChange={(e) => set('caption', e.target.value)}
                            className="mt-1 block w-full text-xs"
                        />
                    </Field>
                </div>
            );

        case 'download':
            return (
                <div className="space-y-4">
                    <Field label="Label">
                        <TextInput
                            value={content.label || ''}
                            onChange={(e) => set('label', e.target.value)}
                            className="mt-1 block w-full text-xs"
                        />
                    </Field>
                    <Field label="File URL">
                        <TextInput
                            value={content.url || ''}
                            onChange={(e) => set('url', e.target.value)}
                            className="mt-1 block w-full text-xs"
                        />
                    </Field>
                </div>
            );

        case 'code':
            return (
                <div className="space-y-4">
                    <Field label="Language">
                        <TextInput
                            value={content.language || ''}
                            onChange={(e) => set('language', e.target.value)}
                            placeholder="bash, php, python…"
                            className="mt-1 block w-full text-xs"
                        />
                    </Field>
                    <Field label="Code">
                        <textarea
                            rows={8}
                            value={content.code || ''}
                            onChange={(e) => set('code', e.target.value)}
                            className={`${fieldClass} font-mono`}
                        />
                    </Field>
                </div>
            );

        default:
            return <p className="text-[11px] text-gray-400 dark:text-gray-500">No editor for this component.</p>;
    }
}
