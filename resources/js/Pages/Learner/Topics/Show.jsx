import React, { useState } from 'react';
import LearnerTopicLayout from '@/Layouts/LearnerTopicLayout';
import { Head } from '@inertiajs/react';
import {
    Info,
    Lightbulb,
    AlertTriangle,
    OctagonAlert,
    CheckCircle2,
    FileText,
    Globe,
    ChevronDown,
} from 'lucide-react';

const CALLOUT_TONES = {
    info: {
        wrap: 'border-sky-500/30 bg-sky-50 dark:bg-sky-500/5',
        title: 'text-sky-600 dark:text-sky-400',
        Icon: Info,
    },
    tip: {
        wrap: 'border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/5',
        title: 'text-emerald-600 dark:text-emerald-400',
        Icon: Lightbulb,
    },
    warning: {
        wrap: 'border-amber-500/30 bg-amber-50 dark:bg-amber-500/5',
        title: 'text-amber-600 dark:text-amber-400',
        Icon: AlertTriangle,
    },
    danger: {
        wrap: 'border-red-500/30 bg-red-50 dark:bg-red-500/5',
        title: 'text-red-600 dark:text-red-400',
        Icon: OctagonAlert,
    },
    success: {
        wrap: 'border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/5',
        title: 'text-emerald-600 dark:text-emerald-400',
        Icon: CheckCircle2,
    },
};

function ListBlock({ title, items = [], ordered = false, checklist = false }) {
    return (
        <div className="space-y-4">
            {title && (
                <h4 className="text-sm font-black uppercase tracking-widest text-faint dark:text-white/40">
                    {title}
                </h4>
            )}
            <ul className="space-y-3">
                {items.map((item, index) => (
                    <li
                        key={index}
                        className="flex items-start gap-3 text-sm text-muted dark:text-white/70 leading-relaxed"
                    >
                        {checklist ? (
                            <span className="mt-1 w-4 h-4 rounded border border-line-strong dark:border-white/20 shrink-0" />
                        ) : ordered ? (
                            <span className="mt-0.5 w-5 h-5 rounded-lg bg-accent/10 dark:bg-accent/20 text-[0.625rem] font-black text-accent-light flex items-center justify-center shrink-0 border border-accent/30">
                                {index + 1}
                            </span>
                        ) : (
                            <span className="mt-2 w-1.5 h-1.5 rounded-full bg-accent shrink-0 shadow-[0_0_5px_rgba(91,95,199,0.5)]" />
                        )}
                        <span>{item}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function BlockRenderer({ block }) {
    const content = block.content || {};
    const variant = block.variant;

    switch (block.type) {
        case 'rich_text':
            if (variant === 'heading') {
                const Tag = content.level === 3 ? 'h3' : content.level === 4 ? 'h4' : 'h2';
                const size = content.level === 3 ? 'text-xl' : content.level === 4 ? 'text-lg' : 'text-3xl';
                return (
                    <div className="mb-6">
                        <Tag className={`${size} font-black text-ink dark:text-white tracking-tight`}>
                            {content.text}
                        </Tag>
                        <div className="h-1 w-12 bg-accent rounded-full mt-2" />
                    </div>
                );
            }
            if (variant === 'objectives' || variant === 'checklist' || variant === 'steps') {
                return (
                    <div className="p-6 rounded-3xl bg-sunken dark:bg-white/5 border border-line-strong dark:border-white/10">
                        <ListBlock
                            title={content.title}
                            items={content.items}
                            ordered={variant === 'steps'}
                            checklist={variant === 'checklist'}
                        />
                    </div>
                );
            }
            if (variant === 'divider') {
                return <hr className="border-line-strong dark:border-white/5 my-8" />;
            }
            if (variant === 'table') {
                const headers = content.headers || [];
                const rows = content.rows || [];
                return (
                    <div className="overflow-hidden rounded-2xl border border-line-strong dark:border-white/10 bg-sunken dark:bg-white/5">
                        <table className="w-full text-xs text-left">
                            {headers.length > 0 && (
                                <thead className="bg-surface dark:bg-white/5 border-b border-line-strong dark:border-white/10">
                                    <tr>
                                        {headers.map((header, index) => (
                                            <th key={index} className="px-4 py-3 font-black uppercase tracking-widest text-faint dark:text-white/40">
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                            )}
                            <tbody className="divide-y divide-line-strong dark:divide-white/5">
                                {rows.map((row, rowIndex) => (
                                    <tr key={rowIndex}>
                                        {row.map((cell, cellIndex) => (
                                            <td key={cellIndex} className="px-4 py-3 text-muted dark:text-white/70">
                                                {cell}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            }
            return (
                <p className="text-base leading-relaxed text-muted dark:text-white/60 whitespace-pre-line mb-6">
                    {content.text}
                </p>
            );

        case 'callout':
            if (variant === 'accordion') {
                const items = content.items || [];
                return (
                    <div className="divide-y divide-line-strong dark:divide-white/5 overflow-hidden rounded-2xl border border-line-strong dark:border-white/10 bg-sunken dark:bg-white/5">
                        {items.map((item, index) => (
                            <div key={index} className="px-6 py-4">
                                <div className="text-sm font-bold text-ink dark:text-white flex items-center justify-between gap-4">
                                    {item.title}
                                    <ChevronDown className="w-4 h-4 text-faint dark:text-white/20" />
                                </div>
                                {item.text && (
                                    <p className="mt-2 text-sm text-muted dark:text-white/50 leading-relaxed">
                                        {item.text}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                );
            }
            const tone = CALLOUT_TONES[content.tone] || CALLOUT_TONES.info;
            const Icon = tone.Icon;
            return (
                <div className={`flex gap-4 rounded-3xl border p-6 ${tone.wrap}`}>
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border border-line-strong dark:border-white/10 ${tone.wrap}`}>
                        <Icon className={`w-5 h-5 ${tone.title}`} />
                    </div>
                    <div className="space-y-2">
                        {content.title && <h4 className={`text-sm font-black uppercase tracking-widest ${tone.title}`}>{content.title}</h4>}
                        <p className="text-sm leading-relaxed text-muted dark:text-white/70">
                            {content.text}
                        </p>
                    </div>
                </div>
            );

        case 'video':
            return (
                <div className="space-y-4 mb-8">
                    {content.url && (
                        <div className="aspect-video w-full overflow-hidden rounded-3xl bg-black border border-line-strong dark:border-white/10 shadow-2xl">
                            <iframe
                                src={content.url}
                                title={content.title || 'Video'}
                                className="h-full w-full"
                                allowFullScreen
                            />
                        </div>
                    )}
                    {content.caption && (
                        <p className="text-xs text-center text-faint dark:text-white/40 italic">{content.caption}</p>
                    )}
                </div>
            );

        case 'code':
            const isTerminal = variant === 'terminal';
            return (
                <div className={`overflow-hidden rounded-2xl border ${isTerminal ? 'border-line-strong dark:border-white/10 bg-black' : 'border-line-strong dark:border-white/10 bg-[#0F172A]'} mb-6 shadow-2xl`}>
                    <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-white/5">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/40" />
                            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20 border border-amber-500/40" />
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/40" />
                        </div>
                        <span className="text-[0.625rem] font-black uppercase tracking-widest text-white/20">
                            {content.language || 'text'}
                        </span>
                    </div>
                    <pre className="overflow-x-auto p-6 text-sm leading-relaxed text-emerald-400 font-mono">
                        <code>{content.code}</code>
                    </pre>
                </div>
            );

        case 'embed':
            if (variant === 'card' && content.url) {
                return (
                    <figure className="space-y-3 mb-8">
                        <img
                            src={content.url}
                            alt={content.alt || ''}
                            className="w-full rounded-3xl border border-line-strong dark:border-white/10 shadow-2xl"
                        />
                        {content.caption && (
                            <figcaption className="text-center text-xs text-faint dark:text-white/40 italic">
                                {content.caption}
                            </figcaption>
                        )}
                    </figure>
                );
            }
            return (
                <a
                    href={content.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 rounded-2xl border border-line-strong dark:border-white/10 bg-sunken dark:bg-white/5 hover:bg-surface dark:hover:bg-white/10 transition-all group mb-6"
                >
                    <div className="w-10 h-10 rounded-xl bg-surface dark:bg-white/5 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <Globe className="w-5 h-5 text-accent" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-bold text-ink dark:text-white truncate">{content.title || 'Open Link'}</p>
                        <p className="text-xs text-faint dark:text-white/30 truncate">{content.url}</p>
                    </div>
                </a>
            );

        default:
            return null;
    }
}

function PageRenderer({ page }) {
    const layoutType = page.layout_type || 'single_column';
    const blocks = page.blocks || [];

    if (layoutType === 'split_two_column') {
        const leftBlocks = blocks.filter(b => b.slot === 'left');
        const rightBlocks = blocks.filter(b => b.slot === 'right');
        return (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                <div className="lg:col-span-7 space-y-6">
                    {leftBlocks.map(block => <BlockRenderer key={block.id} block={block} />)}
                </div>
                <div className="lg:col-span-5 space-y-6">
                    {rightBlocks.map(block => <BlockRenderer key={block.id} block={block} />)}
                </div>
            </div>
        );
    }

    if (layoutType === 'cinema_focus') {
        const mainBlocks = blocks.filter(b => b.slot === 'main');
        const sidebarBlocks = blocks.filter(b => b.slot === 'sidebar');
        return (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-9 space-y-6">
                    {mainBlocks.map(block => <BlockRenderer key={block.id} block={block} />)}
                </div>
                <div className="lg:col-span-3 space-y-6">
                    {sidebarBlocks.map(block => <BlockRenderer key={block.id} block={block} />)}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {blocks.map(block => <BlockRenderer key={block.id} block={block} />)}
        </div>
    );
}

/**
 * Pages for a stage, preceded by its title page so every stage opens on a
 * heading with the stage title.
 */
function stagePages(section) {
    return [
        { id: `stage-intro-${section.id}`, isStageIntro: true, title: section.title },
        ...(section.pages || []),
    ];
}

function StageIntroPage({ title, stageIndex, totalStages }) {
    return (
        <div className="max-w-3xl mx-auto py-20 sm:py-32 text-center">
            <p className="text-[0.6875rem] font-black uppercase tracking-[0.3em] text-accent-light">
                Stage {stageIndex} of {totalStages}
            </p>
            <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-ink dark:text-white">
                {title}
            </h1>
            <div className="h-1 w-20 bg-accent rounded-full mt-6 mx-auto" />
        </div>
    );
}

export default function Show({ course, module, topic }) {
    // Deep link support: the stage editor's Preview opens ?stage=<id>.
    const [currentSectionIndex, setCurrentSectionIndex] = useState(() => {
        const stageId = new URLSearchParams(window.location.search).get('stage');
        if (!stageId) {
            return 0;
        }
        const index = topic.sections.findIndex((section) => String(section.id) === String(stageId));
        return index === -1 ? 0 : index;
    });
    const [currentPageIndex, setCurrentPageIndex] = useState(0);

    const currentSection = topic.sections[currentSectionIndex];
    const currentStagePages = currentSection ? stagePages(currentSection) : [];
    const currentPage = currentStagePages[currentPageIndex];

    const totalPages = topic.sections.reduce((acc, section) => acc + stagePages(section).length, 0);
    const currentPageGlobalIndex = topic.sections
        .slice(0, currentSectionIndex)
        .reduce((acc, section) => acc + stagePages(section).length, 0) + currentPageIndex + 1;

    const handleNext = () => {
        if (currentPageIndex < currentStagePages.length - 1) {
            setCurrentPageIndex(currentPageIndex + 1);
        } else if (currentSectionIndex < topic.sections.length - 1) {
            setCurrentSectionIndex(currentSectionIndex + 1);
            setCurrentPageIndex(0);
        }
    };

    const handleBack = () => {
        if (currentPageIndex > 0) {
            setCurrentPageIndex(currentPageIndex - 1);
        } else if (currentSectionIndex > 0) {
            const prevSectionIndex = currentSectionIndex - 1;
            const prevStagePages = stagePages(topic.sections[prevSectionIndex]);
            setCurrentSectionIndex(prevSectionIndex);
            setCurrentPageIndex(prevStagePages.length - 1);
        }
    };

    const handleSelectStage = (index) => {
        setCurrentSectionIndex(index);
        setCurrentPageIndex(0);
    };

    const canGoNext = currentSectionIndex < topic.sections.length - 1 || currentPageIndex < currentStagePages.length - 1;
    const canGoBack = currentSectionIndex > 0 || currentPageIndex > 0;
    const isLastPage = !canGoNext;

    return (
        <LearnerTopicLayout
            course={course}
            module={module}
            topic={topic}
            sections={topic.sections}
            currentSection={currentSection}
            currentPage={currentPageGlobalIndex}
            totalPages={totalPages}
            onNext={handleNext}
            onBack={handleBack}
            onSelectStage={handleSelectStage}
            canGoNext={canGoNext}
            canGoBack={canGoBack}
            isLastPage={isLastPage}
        >
            <Head title={`${topic.title} - ${module.title}`} />

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                {currentPage ? (
                    currentPage.isStageIntro ? (
                        <StageIntroPage
                            title={currentSection.title}
                            stageIndex={currentSectionIndex + 1}
                            totalStages={topic.sections.length}
                        />
                    ) : (
                        <PageRenderer page={currentPage} />
                    )
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 text-faint dark:text-white/20">
                        <FileText className="w-16 h-16 mb-4 opacity-10" />
                        <p className="text-sm font-bold uppercase tracking-widest">No content on this page</p>
                    </div>
                )}
            </div>
        </LearnerTopicLayout>
    );
}
