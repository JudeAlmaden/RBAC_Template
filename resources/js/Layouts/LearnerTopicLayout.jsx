import React, { useEffect, useState } from 'react';
import { Link } from '@inertiajs/react';
import NotificationPanel from '@/Components/NotificationPanel';
import useTheme from '@/theme';
import {
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    PanelLeft,
    PanelLeftClose,
    Sun,
    Moon,
    X,
} from 'lucide-react';

/* ─── Stage list (current topic only) ─────────────────────────────────── */

function StageItem({ section, index, isActive, onSelect }) {
    // The stage title page counts as the first page of the stage.
    const pageCount = (section.pages?.length || 0) + 1;

    return (
        <button
            type="button"
            onClick={() => onSelect(index)}
            className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                isActive
                    ? 'bg-accent/10 dark:bg-accent/20'
                    : 'hover:bg-surface dark:hover:bg-white/5'
            }`}
        >
            <span
                className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center text-[0.625rem] font-bold shrink-0 ${
                    isActive
                        ? 'bg-accent border-accent text-white'
                        : 'border-line-strong dark:border-white/20 text-faint dark:text-sidebar-ink'
                }`}
            >
                {index + 1}
            </span>
            <span className="min-w-0">
                <span
                    className={`block text-xs font-semibold truncate ${
                        isActive
                            ? 'text-ink dark:text-white'
                            : 'text-muted'
                    }`}
                >
                    {section.title}
                </span>
                <span className="block text-[0.625rem] text-faint dark:text-sidebar-faint">
                    {pageCount} {pageCount === 1 ? 'page' : 'pages'}
                </span>
            </span>
        </button>
    );
}

function TopicStagesSidebar({ course, module, topic, sections, currentSection, onSelectStage }) {
    const activeIndex = sections.findIndex((section) => section.id === currentSection?.id);

    return (
        <>
            <div className="h-14 px-4 flex items-center justify-between border-b border-line-strong dark:border-brand-border shrink-0">
                <Link
                    href={route('learner.modules.show', { course: course.id, module: module.id })}
                    className="flex items-center gap-2 text-[0.625rem] font-bold uppercase tracking-[0.15em] text-muted dark:text-sidebar-ink hover:text-accent dark:hover:text-white transition"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back
                </Link>
            </div>

            <div className="px-5 py-4 border-b border-line-strong dark:border-brand-border shrink-0">
                <p className="text-[0.5625rem] font-black uppercase tracking-[0.2em] text-accent-light truncate">
                    {module.title}
                </p>
                <h1 className="mt-1 text-sm font-extrabold leading-snug text-ink dark:text-white">
                    {topic.title}
                </h1>
            </div>

            <nav className="flex-1 overflow-y-auto custom-scrollbar px-2 py-3 space-y-1">
                <div className="px-3 pb-1 text-[0.625rem] font-bold uppercase tracking-widest text-faint dark:text-sidebar-faint">
                    Stages
                </div>
                {sections.map((section, index) => (
                    <StageItem
                        key={section.id}
                        section={section}
                        index={index}
                        isActive={section.id === currentSection?.id}
                        onSelect={onSelectStage}
                    />
                ))}
            </nav>

            {sections.length > 0 && (
                <div className="shrink-0 px-5 py-3 border-t border-line-strong dark:border-brand-border">
                    <div className="flex items-center justify-between text-[0.625rem] font-bold uppercase tracking-widest text-faint dark:text-sidebar-faint">
                        <span>Stage</span>
                        <span>
                            {activeIndex + 1} / {sections.length}
                        </span>
                    </div>
                </div>
            )}
        </>
    );
}

/* ─── Layout ──────────────────────────────────────────────────────────── */

export default function LearnerTopicLayout({
    course,
    module,
    topic,
    sections = [],
    currentSection,
    currentPage,
    totalPages,
    onNext,
    onBack,
    onSelectStage,
    canGoNext = true,
    canGoBack = true,
    isLastPage = false,
    children,
}) {
    const [dark, setDark] = useTheme();

    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);

    const progress = totalPages > 0 ? (currentPage / totalPages) * 100 : 0;

    return (
        <div className="h-screen flex overflow-hidden bg-page dark:bg-brand-dark text-ink font-sans antialiased">
            {/* MOBILE BACKDROP */}
            {mobileSidebarOpen && (
                <div
                    onClick={() => setMobileSidebarOpen(false)}
                    className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm"
                />
            )}

            {/* STAGES SIDEBAR */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-72 bg-page dark:bg-brand-surface border-r border-line-strong dark:border-brand-border flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 lg:transition-none ${
                    mobileSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
                } ${desktopSidebarOpen ? 'lg:flex' : 'lg:hidden'}`}
            >
                <div className="lg:hidden absolute top-3 right-3">
                    <button
                        onClick={() => setMobileSidebarOpen(false)}
                        className="p-1.5 rounded-lg text-faint hover:text-ink dark:hover:text-white hover:bg-surface dark:hover:bg-white/10"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <TopicStagesSidebar
                    course={course}
                    module={module}
                    topic={topic}
                    sections={sections}
                    currentSection={currentSection}
                    onSelectStage={(index) => {
                        setMobileSidebarOpen(false);
                        onSelectStage?.(index);
                    }}
                />
            </aside>

            {/* MAIN COLUMN */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* SLIM TOP NAV — theme + notifications */}
                <header className="h-14 shrink-0 bg-page dark:bg-brand-dark/80 dark:backdrop-blur-md border-b border-line-strong dark:border-brand-border flex items-center justify-between px-4 sm:px-6 z-30">
                    <button
                        onClick={() => {
                            if (window.innerWidth < 1024) {
                                setMobileSidebarOpen(true);
                            } else {
                                setDesktopSidebarOpen((open) => !open);
                            }
                        }}
                        className="p-2 rounded-lg text-muted dark:text-sidebar-ink hover:text-ink dark:hover:text-white hover:bg-surface dark:hover:bg-brand-surface transition"
                        title="Toggle stages"
                    >
                        {desktopSidebarOpen ? (
                            <PanelLeftClose className="w-4 h-4" />
                        ) : (
                            <PanelLeft className="w-4 h-4" />
                        )}
                    </button>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setDark(!dark)}
                            className="p-2 rounded-lg text-muted dark:text-sidebar-ink hover:text-ink dark:hover:text-white hover:bg-surface dark:hover:bg-brand-surface transition"
                            title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
                        >
                            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        </button>
                        <div className="relative">
                            <NotificationPanel />
                        </div>
                    </div>
                </header>

                {/* READING SURFACE — the only white area in light mode */}
                <div className="flex-1 overflow-y-auto custom-scrollbar overflow-x-hidden bg-surface dark:bg-brand-dark">
                    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10 py-8">
                        {children}
                    </div>
                </div>

                {/* PLAYER CONTROLS (BOTTOM BAR) */}
                <footer className="h-20 bg-page/90 dark:bg-brand-dark/80 backdrop-blur-xl border-t border-line-strong dark:border-brand-border flex items-center justify-between px-5 sm:px-8 shrink-0">
                    <button
                        onClick={onBack}
                        disabled={!canGoBack}
                        className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl text-[0.6875rem] font-bold uppercase tracking-widest transition-all group ${
                            canGoBack
                                ? 'bg-transparent dark:bg-white/5 text-muted dark:text-white/60 border border-line-strong dark:border-white/10 hover:text-ink dark:hover:text-white hover:bg-surface dark:hover:bg-white/10 active:scale-95'
                                : 'opacity-40 cursor-not-allowed grayscale text-faint dark:text-white/40'
                        }`}
                    >
                        <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                        Previous
                    </button>

                    <div className="flex flex-col items-center gap-3">
                        <div className="flex items-center gap-4">
                            <span className="text-[0.625rem] font-black tracking-[0.3em] text-faint dark:text-white/20 uppercase">
                                Page
                            </span>
                            <div className="flex items-center justify-center min-w-[60px] h-8 rounded-full bg-page dark:bg-white/5 border border-line-strong dark:border-white/10 text-[0.8125rem] font-black text-accent-light">
                                {currentPage}
                                <span className="mx-1 text-line-strong dark:text-white/20">/</span>
                                {totalPages}
                            </div>
                        </div>
                        <div className="w-48 sm:w-80 h-1.5 bg-surface dark:bg-white/5 rounded-full overflow-hidden relative border border-line-strong dark:border-white/5">
                            <div
                                className="absolute inset-y-0 left-0 bg-gradient-to-r from-accent to-accent-light rounded-full transition-all duration-700 ease-out"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    <button
                        onClick={onNext}
                        disabled={!canGoNext && !isLastPage}
                        className={`flex items-center gap-3 px-6 sm:px-8 py-3 rounded-2xl text-[0.6875rem] font-black uppercase tracking-widest transition-all active:scale-95 group ${
                            canGoNext || isLastPage
                                ? 'bg-accent text-white shadow-lg shadow-accent/20 hover:bg-accent-hover hover:-translate-y-0.5'
                                : 'opacity-40 cursor-not-allowed grayscale bg-accent text-white'
                        }`}
                    >
                        {isLastPage ? 'Complete Topic' : 'Next Step'}
                        <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </button>
                </footer>
            </div>
        </div>
    );
}
