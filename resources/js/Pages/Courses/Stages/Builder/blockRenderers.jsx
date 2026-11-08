import React, { useEffect, useRef } from 'react';
import {
    Info,
    Lightbulb,
    AlertTriangle,
    OctagonAlert,
    CheckCircle2,
    Play,
    Volume2,
    Image as ImageIcon,
    Globe,
    Download,
    FileText,
} from 'lucide-react';

/**
 * A simple inline text editor using contenteditable.
 */
function InlineTextEditor({ value, onChange, onBlur, className, placeholder }) {
    const ref = useRef(null);

    useEffect(() => {
        if (ref.current && ref.current.innerText !== value) {
            ref.current.innerText = value;
        }
    }, [value]);

    useEffect(() => {
        // Auto-focus when entering edit mode
        if (ref.current) {
            ref.current.focus();
            // Move cursor to end
            const range = document.createRange();
            const sel = window.getSelection();
            range.selectNodeContents(ref.current);
            range.collapse(false);
            sel.removeAllRanges();
            sel.addRange(range);
        }
    }, []);

    const handleInput = () => {
        if (ref.current) {
            onChange(ref.current.innerText);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            ref.current?.blur();
        }
    };

    return (
        <div
            ref={ref}
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            onBlur={onBlur}
            onKeyDown={handleKeyDown}
            className={`outline-none focus:ring-1 focus:ring-accent/30 rounded px-0.5 -mx-0.5 transition ${className}`}
            placeholder={placeholder}
        />
    );
}

const CALLOUT_TONES = {
    info: {
        wrap: 'border-sky-200 bg-sky-50 dark:border-sky-900 dark:bg-sky-950/40',
        title: 'text-sky-800 dark:text-sky-300',
        Icon: Info,
    },
    tip: {
        wrap: 'border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40',
        title: 'text-emerald-800 dark:text-emerald-300',
        Icon: Lightbulb,
    },
    warning: {
        wrap: 'border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40',
        title: 'text-amber-800 dark:text-amber-300',
        Icon: AlertTriangle,
    },
    danger: {
        wrap: 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/40',
        title: 'text-red-800 dark:text-red-300',
        Icon: OctagonAlert,
    },
    success: {
        wrap: 'border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40',
        title: 'text-emerald-800 dark:text-emerald-300',
        Icon: CheckCircle2,
    },
};

function Empty({ label }) {
    return (
        <div className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-line dark:border-brand-border bg-raised dark:bg-brand-dark px-4 py-6 text-[0.6875rem] text-gray-400 dark:text-gray-500">
            <FileText className="w-3.5 h-3.5" />
            {label}
        </div>
    );
}

function ListBlock({ title, items = [], ordered = false, checklist = false, isEditing, onContentChange, onBlur }) {
    if (!items.length && !isEditing) {
        return <Empty label="No items yet — add them in the inspector." />;
    }

    const handleItemChange = (index, newValue) => {
        const newItems = [...items];
        newItems[index] = newValue;
        onContentChange({ items: newItems });
    };

    return (
        <div className="space-y-2">
            {isEditing ? (
                <InlineTextEditor
                    value={title || ''}
                    onChange={(val) => onContentChange({ title: val })}
                    onBlur={onBlur}
                    className="text-xs font-bold text-gray-900 dark:text-white block w-full"
                    placeholder="List title..."
                />
            ) : (
                title && <p className="text-xs font-bold text-gray-900 dark:text-white">{title}</p>
            )}
            <ul className="space-y-1.5">
                {items.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300">
                        {checklist ? (
                            <span className="mt-0.5 w-3.5 h-3.5 rounded border border-line-strong dark:border-line shrink-0" />
                        ) : ordered ? (
                            <span className="mt-0.5 w-4 h-4 rounded-full bg-accent/10 dark:bg-accent/25 text-[0.5625rem] font-bold text-accent-light flex items-center justify-center shrink-0">
                                {index + 1}
                            </span>
                        ) : (
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-faint shrink-0" />
                        )}
                        {isEditing ? (
                            <InlineTextEditor
                                value={item}
                                onChange={(val) => handleItemChange(index, val)}
                                onBlur={onBlur}
                                className="leading-relaxed flex-1"
                            />
                        ) : (
                            <span className="leading-relaxed">{item}</span>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}

function CalloutBox({ content, isEditing, onContentChange, onBlur }) {
    const tone = CALLOUT_TONES[content.tone] || CALLOUT_TONES.info;
    const Icon = tone.Icon;

    return (
        <div className={`flex gap-2.5 rounded-lg border px-3.5 py-3 ${tone.wrap}`}>
            <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${tone.title}`} />
            <div className="min-w-0 flex-1">
                {isEditing ? (
                    <>
                        <InlineTextEditor
                            value={content.title || ''}
                            onChange={(val) => onContentChange({ title: val })}
                            onBlur={onBlur}
                            className={`text-xs font-bold ${tone.title} block w-full`}
                            placeholder="Callout title..."
                        />
                        <InlineTextEditor
                            value={content.text || ''}
                            onChange={(val) => onContentChange({ text: val })}
                            onBlur={onBlur}
                            className="mt-0.5 text-[0.6875rem] leading-relaxed text-gray-700 dark:text-gray-300 block w-full"
                            placeholder="Callout text..."
                        />
                    </>
                ) : (
                    <>
                        {content.title && <p className={`text-xs font-bold ${tone.title}`}>{content.title}</p>}
                        <p className="mt-0.5 text-[0.6875rem] leading-relaxed text-gray-700 dark:text-gray-300">
                            {content.text || 'Callout text.'}
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}

/**
 * Renders a single block's content for the canvas (read/preview surface).
 * Interactive editing happens in the Inspector OR inline if isEditing is true.
 */
export default function BlockPreview({ block, isEditing, onContentChange, onBlur }) {
    const content = block.content || {};
    const variant = block.display_variant;

    switch (block.block_type) {
        case 'rich_text':
            if (variant === 'heading') {
                const Tag = content.level === 3 ? 'h3' : content.level === 4 ? 'h4' : 'h2';
                const size = content.level === 3 ? 'text-base' : content.level === 4 ? 'text-sm' : 'text-lg';
                if (isEditing) {
                    return (
                        <InlineTextEditor
                            value={content.text || ''}
                            onChange={(val) => onContentChange({ text: val })}
                            onBlur={onBlur}
                            className={`${size} font-bold text-gray-900 dark:text-white leading-snug block w-full`}
                            placeholder="Heading..."
                        />
                    );
                }
                return (
                    <Tag className={`${size} font-bold text-gray-900 dark:text-white leading-snug`}>
                        {content.text || 'Heading'}
                    </Tag>
                );
            }
            if (variant === 'objectives') {
                return (
                    <ListBlock
                        title={content.title}
                        items={content.items}
                        isEditing={isEditing}
                        onContentChange={onContentChange}
                        onBlur={onBlur}
                    />
                );
            }
            if (variant === 'checklist') {
                return (
                    <ListBlock
                        title={content.title}
                        items={content.items}
                        checklist
                        isEditing={isEditing}
                        onContentChange={onContentChange}
                        onBlur={onBlur}
                    />
                );
            }
            if (variant === 'steps') {
                return (
                    <ListBlock
                        title={content.title}
                        items={content.items}
                        ordered
                        isEditing={isEditing}
                        onContentChange={onContentChange}
                        onBlur={onBlur}
                    />
                );
            }
            if (variant === 'divider') {
                return <hr className="border-line dark:border-brand-border" />;
            }
            if (variant === 'table') {
                const headers = content.headers || [];
                const rows = content.rows || [];
                if (!headers.length && !rows.length && !isEditing) {
                    return <Empty label="Empty table — configure columns in the inspector." />;
                }

                const handleHeaderChange = (index, val) => {
                    const newHeaders = [...headers];
                    newHeaders[index] = val;
                    onContentChange({ headers: newHeaders });
                };

                const handleCellChange = (rowIndex, cellIndex, val) => {
                    const newRows = [...rows];
                    newRows[rowIndex][cellIndex] = val;
                    onContentChange({ rows: newRows });
                };

                return (
                    <div className="overflow-hidden rounded-lg border border-line dark:border-brand-border">
                        <table className="w-full text-xs">
                            {headers.length > 0 && (
                                <thead className="bg-raised dark:bg-brand-dark">
                                    <tr>
                                        {headers.map((header, index) => (
                                            <th
                                                key={index}
                                                className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300"
                                            >
                                                {isEditing ? (
                                                    <InlineTextEditor
                                                        value={header}
                                                        onChange={(val) => handleHeaderChange(index, val)}
                                                        onBlur={onBlur}
                                                        className="block w-full"
                                                    />
                                                ) : (
                                                    header
                                                )}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                            )}
                            <tbody>
                                {rows.map((row, rowIndex) => (
                                    <tr key={rowIndex} className="border-t border-line dark:border-brand-border">
                                        {row.map((cell, cellIndex) => (
                                            <td key={cellIndex} className="px-3 py-2 text-gray-600 dark:text-gray-400">
                                                {isEditing ? (
                                                    <InlineTextEditor
                                                        value={cell}
                                                        onChange={(val) => handleCellChange(rowIndex, cellIndex, val)}
                                                        onBlur={onBlur}
                                                        className="block w-full"
                                                    />
                                                ) : (
                                                    cell
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            }
            if (isEditing) {
                return (
                    <InlineTextEditor
                        value={content.text || ''}
                        onChange={(val) => onContentChange({ text: val })}
                        onBlur={onBlur}
                        className="text-xs leading-relaxed text-gray-700 dark:text-gray-300 block w-full"
                        placeholder="Type paragraph content..."
                    />
                );
            }
            return (
                <p className="text-xs leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-line">
                    {content.text || 'Empty paragraph.'}
                </p>
            );

        case 'callout':
            if (variant === 'accordion') {
                const items = content.items || [];
                if (!items.length && !isEditing) {
                    return <Empty label="No panels yet — add them in the inspector." />;
                }

                const handleAccordionItemChange = (index, field, val) => {
                    const newItems = [...items];
                    newItems[index] = { ...newItems[index], [field]: val };
                    onContentChange({ items: newItems });
                };

                return (
                    <div className="divide-y divide-line dark:divide-brand-border overflow-hidden rounded-lg border border-line dark:border-brand-border">
                        {items.map((item, index) => (
                            <div key={index} className="px-3 py-2.5">
                                <div className="text-xs font-semibold text-gray-900 dark:text-white flex items-center justify-between gap-2">
                                    {isEditing ? (
                                        <InlineTextEditor
                                            value={item.title}
                                            onChange={(val) => handleAccordionItemChange(index, 'title', val)}
                                            onBlur={onBlur}
                                            className="flex-1"
                                            placeholder="Panel title..."
                                        />
                                    ) : (
                                        item.title
                                    )}
                                    <span className="text-gray-400">＋</span>
                                </div>
                                {isEditing ? (
                                    <InlineTextEditor
                                        value={item.text || ''}
                                        onChange={(val) => handleAccordionItemChange(index, 'text', val)}
                                        onBlur={onBlur}
                                        className="mt-1 text-[0.6875rem] text-gray-500 dark:text-gray-400 leading-relaxed block w-full"
                                        placeholder="Panel text..."
                                    />
                                ) : (
                                    item.text && (
                                        <p className="mt-1 text-[0.6875rem] text-gray-500 dark:text-gray-400 leading-relaxed">
                                            {item.text}
                                        </p>
                                    )
                                )}
                            </div>
                        ))}
                    </div>
                );
            }

            return (
                <CalloutBox
                    content={content}
                    isEditing={isEditing}
                    onContentChange={onContentChange}
                    onBlur={onBlur}
                />
            );

        case 'video':
            return (
                <div className="space-y-2">
                    {content.url ? (
                        <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
                            <iframe
                                src={content.url}
                                title={content.title || 'Video'}
                                className="h-full w-full"
                                allowFullScreen
                            />
                        </div>
                    ) : (
                        <div className="aspect-video w-full rounded-lg border border-dashed border-line dark:border-brand-border bg-raised dark:bg-brand-dark flex flex-col items-center justify-center gap-2">
                            <Play className="w-6 h-6 text-gray-300 dark:text-gray-600" />
                            <span className="text-[0.6875rem] text-gray-400 dark:text-gray-500">Add a video URL</span>
                        </div>
                    )}
                    {content.caption && (
                        <p className="text-[0.6875rem] text-gray-500 dark:text-gray-400">{content.caption}</p>
                    )}
                </div>
            );

        case 'audio':
            return (
                <div className="flex items-center gap-3 rounded-lg border border-line dark:border-brand-border bg-raised dark:bg-brand-dark px-3.5 py-3">
                    <span className="w-8 h-8 rounded-full bg-accent/10 dark:bg-accent/25 flex items-center justify-center shrink-0">
                        <Volume2 className="w-4 h-4 text-accent-light" />
                    </span>
                    <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                            {content.title || 'Audio'}
                        </p>
                        <p className="text-[0.625rem] text-gray-400 truncate">{content.url || 'No source set'}</p>
                    </div>
                </div>
            );

        case 'embed':
            if (variant === 'card') {
                return (
                    <figure className="space-y-2">
                        {content.url ? (
                            <img
                                src={content.url}
                                alt={content.alt || ''}
                                className="w-full rounded-lg border border-line dark:border-brand-border object-cover"
                            />
                        ) : (
                            <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-line dark:border-brand-border bg-raised dark:bg-brand-dark">
                                <ImageIcon className="w-6 h-6 text-gray-300 dark:text-gray-600" />
                                <span className="text-[0.6875rem] text-gray-400 dark:text-gray-500">Add an image URL</span>
                            </div>
                        )}
                        {content.caption && (
                            <figcaption className="text-center text-[0.6875rem] text-gray-500 dark:text-gray-400">
                                {content.caption}
                            </figcaption>
                        )}
                    </figure>
                );
            }
            return (
                <div className="flex items-center gap-3 rounded-lg border border-line dark:border-brand-border bg-raised dark:bg-brand-dark px-3.5 py-3">
                    <Globe className="w-4 h-4 text-accent shrink-0" />
                    <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                            {content.title || 'Embedded resource'}
                        </p>
                        <p className="text-[0.625rem] text-gray-400 truncate">{content.url || 'No URL set'}</p>
                    </div>
                </div>
            );

        case 'download':
            return (
                <div className="flex items-center gap-3 rounded-lg border border-line dark:border-brand-border bg-surface dark:bg-brand-surface px-3.5 py-3">
                    <span className="w-8 h-8 rounded-lg bg-accent/10 dark:bg-accent/25 flex items-center justify-center shrink-0">
                        <Download className="w-4 h-4 text-accent-light" />
                    </span>
                    <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                            {content.label || 'Download resource'}
                        </p>
                        <p className="text-[0.625rem] text-gray-400 truncate">{content.url || 'No file attached'}</p>
                    </div>
                </div>
            );

        case 'code': {
            const isTerminal = variant === 'terminal';
            return (
                <div
                    className={`overflow-hidden rounded-lg border ${
                        isTerminal
                            ? 'border-black/60 bg-[#0B0B0F]'
                            : 'border-line dark:border-brand-border bg-[#0F172A]'
                    }`}
                >
                    <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/10">
                        <span className="text-[0.625rem] font-semibold uppercase tracking-wider text-gray-400">
                            {content.language || 'text'}
                        </span>
                        {isTerminal && <span className="text-[0.625rem] text-gray-500">terminal</span>}
                    </div>
                    <pre className="overflow-x-auto px-3.5 py-3 text-[0.6875rem] leading-relaxed text-emerald-300">
                        <code>{content.code || ''}</code>
                    </pre>
                </div>
            );
        }

        default:
            return <Empty label="Unknown component type." />;
    }
}
