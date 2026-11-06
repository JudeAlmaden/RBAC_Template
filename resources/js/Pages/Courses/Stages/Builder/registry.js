import {
    Type,
    Heading1,
    Info,
    AlertTriangle,
    Target,
    ListChecks,
    ListOrdered,
    ChevronsUpDown,
    Table as TableIcon,
    Minus,
    Video,
    Volume2,
    Image as ImageIcon,
    Code2,
    Terminal,
    Globe,
    Download,
} from 'lucide-react';

/**
 * Layout metadata: maps a section page layout_type to its droppable slots.
 * `weight` drives the flex sizing of each slot column inside the canvas.
 */
export const LAYOUT_SLOTS = {
    single_column: [{ key: 'main', label: 'Main', weight: 12 }],
    split_two_column: [
        { key: 'left', label: 'Left', weight: 7 },
        { key: 'right', label: 'Right', weight: 5 },
    ],
    cinema_focus: [
        { key: 'main', label: 'Canvas', weight: 9 },
        { key: 'sidebar', label: 'Drawer', weight: 3 },
    ],
    tabbed_stepper: [{ key: 'main', label: 'Steps', weight: 12 }],
};

/**
 * Returns the droppable slots for a layout, defaulting to a single main slot.
 */
export function getLayoutSlots(layoutType) {
    return LAYOUT_SLOTS[layoutType] || LAYOUT_SLOTS.single_column;
}

/**
 * The default slot a new block should land in for a given layout.
 */
export function defaultSlotFor(layoutType) {
    const slots = getLayoutSlots(layoutType);
    return slots[0]?.key || 'main';
}

export const BLOCK_TYPE_LABELS = {
    rich_text: 'Rich Text',
    video: 'Video',
    audio: 'Audio',
    code: 'Code',
    callout: 'Callout',
    download: 'Download',
    embed: 'Embed',
};

/**
 * Display variants selectable per block type in the inspector.
 */
export const VARIANTS_BY_TYPE = {
    rich_text: ['default', 'heading', 'objectives', 'checklist', 'steps', 'table', 'divider'],
    callout: ['callout_tip', 'accordion'],
    video: ['card', 'hero', 'default'],
    audio: ['default'],
    code: ['default', 'terminal'],
    download: ['card', 'default'],
    embed: ['default', 'card'],
};

/**
 * Human-readable label for a display variant key.
 */
export function variantLabel(variant) {
    return variant
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

/**
 * Component palette. Each preset maps directly onto a content_blocks row
 * (block_type + display_variant) plus default JSON content.
 */
export const BLOCK_LIBRARY = [
    {
        group: 'Text',
        items: [
            {
                key: 'heading',
                label: 'Heading',
                icon: Heading1,
                block_type: 'rich_text',
                display_variant: 'heading',
                content: { text: 'Section heading', level: 2 },
            },
            {
                key: 'paragraph',
                label: 'Paragraph',
                icon: Type,
                block_type: 'rich_text',
                display_variant: 'default',
                content: { text: 'Write your instructional content here.' },
            },
            {
                key: 'callout_note',
                label: 'Note Callout',
                icon: Info,
                block_type: 'callout',
                display_variant: 'callout_tip',
                content: { tone: 'info', title: 'Note', text: 'Add a helpful note.' },
            },
            {
                key: 'callout_warning',
                label: 'Warning',
                icon: AlertTriangle,
                block_type: 'callout',
                display_variant: 'callout_tip',
                content: { tone: 'warning', title: 'Warning', text: 'Highlight something important.' },
            },
            {
                key: 'objectives',
                label: 'Objectives',
                icon: Target,
                block_type: 'rich_text',
                display_variant: 'objectives',
                content: { title: 'Learning objectives', items: ['First objective'] },
            },
            {
                key: 'checklist',
                label: 'Checklist',
                icon: ListChecks,
                block_type: 'rich_text',
                display_variant: 'checklist',
                content: { title: 'Checklist', items: ['First item'] },
            },
            {
                key: 'steps',
                label: 'Steps',
                icon: ListOrdered,
                block_type: 'rich_text',
                display_variant: 'steps',
                content: { title: 'Steps', items: ['First step'] },
            },
            {
                key: 'accordion',
                label: 'Accordion',
                icon: ChevronsUpDown,
                block_type: 'callout',
                display_variant: 'accordion',
                content: { items: [{ title: 'Panel title', text: 'Panel content.' }] },
            },
            {
                key: 'table',
                label: 'Table',
                icon: TableIcon,
                block_type: 'rich_text',
                display_variant: 'table',
                content: { headers: ['Column A', 'Column B'], rows: [['Value', 'Value']] },
            },
            {
                key: 'divider',
                label: 'Divider',
                icon: Minus,
                block_type: 'rich_text',
                display_variant: 'divider',
                content: {},
            },
        ],
    },
    {
        group: 'Media',
        items: [
            {
                key: 'video',
                label: 'Video',
                icon: Video,
                block_type: 'video',
                display_variant: 'card',
                content: { title: 'Video title', url: '', caption: '' },
            },
            {
                key: 'audio',
                label: 'Audio',
                icon: Volume2,
                block_type: 'audio',
                display_variant: 'default',
                content: { title: 'Audio title', url: '' },
            },
            {
                key: 'image',
                label: 'Image',
                icon: ImageIcon,
                block_type: 'embed',
                display_variant: 'card',
                content: { url: '', alt: 'Describe the image', caption: '' },
            },
            {
                key: 'embed',
                label: 'Embed',
                icon: Globe,
                block_type: 'embed',
                display_variant: 'default',
                content: { url: '', title: 'Embedded resource' },
            },
            {
                key: 'download',
                label: 'Download',
                icon: Download,
                block_type: 'download',
                display_variant: 'card',
                content: { label: 'Download resource', url: '' },
            },
        ],
    },
    {
        group: 'Code',
        items: [
            {
                key: 'code',
                label: 'Code Block',
                icon: Code2,
                block_type: 'code',
                display_variant: 'default',
                content: { language: 'bash', code: 'echo "hello"' },
            },
            {
                key: 'terminal',
                label: 'Terminal',
                icon: Terminal,
                block_type: 'code',
                display_variant: 'terminal',
                content: { language: 'bash', code: '$ nmap -sV target' },
            },
        ],
    },
];

/**
 * Flat lookup of palette presets keyed by preset key.
 */
export const PRESET_BY_KEY = BLOCK_LIBRARY.reduce((acc, group) => {
    group.items.forEach((item) => {
        acc[item.key] = item;
    });
    return acc;
}, {});

let tempCounter = 0;

/**
 * Generates a client-only identifier for unsaved pages/blocks.
 */
export function tempId(prefix = 'tmp') {
    tempCounter += 1;
    return `${prefix}-${Date.now().toString(36)}-${tempCounter}`;
}

/**
 * Builds a brand-new in-memory block from a palette preset.
 */
export function createBlockFromPreset(preset, layoutType = 'single_column') {
    return {
        id: tempId('blk'),
        block_type: preset.block_type,
        display_variant: preset.display_variant,
        layout_slot: defaultSlotFor(layoutType),
        content: JSON.parse(JSON.stringify(preset.content || {})),
        is_visible: true,
        isNew: true,
    };
}

/**
 * Normalizes server blocks into the builder's draft shape.
 */
export function normalizeBlocks(blocks = []) {
    return blocks.map((block) => ({
        id: block.id,
        block_type: block.block_type,
        display_variant: block.display_variant,
        layout_slot: block.layout_slot || 'main',
        content: block.content || {},
        is_visible: block.is_visible !== false,
    }));
}

/**
 * Serializes the builder draft into the payload expected by the save endpoint.
 */
export function serializePages(pages) {
    return pages.map((page, pageIndex) => ({
        id: typeof page.id === 'number' ? page.id : null,
        title: page.title || null,
        layout_type: page.layout_type,
        is_visible: page.is_visible !== false,
        position: pageIndex + 1,
        blocks: (page.blocks || [])
            .filter((block) => getLayoutSlots(page.layout_type).some((slot) => slot.key === block.layout_slot))
            .map((block, blockIndex) => ({
                id: typeof block.id === 'number' ? block.id : null,
                block_type: block.block_type,
                display_variant: block.display_variant,
                layout_slot: block.layout_slot,
                content: block.content || {},
                is_visible: block.is_visible !== false,
                position: blockIndex + 1,
            })),
    }));
}
