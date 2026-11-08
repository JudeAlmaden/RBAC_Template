import React from 'react';
import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Pagination component for Inertia paginator responses.
 *
 * @param {Object} paginator - The Laravel paginator object (from props).
 *   Expected shape: { current_page, last_page, from, to, total, links: [{ url, label, active }] }
 */
export default function Pagination({ paginator, label = 'accounts' }) {
    if (!paginator || paginator.last_page <= 1) return null;

    const { current_page, last_page, from, to, total, links } = paginator;

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 border-t border-line text-xs text-body-muted">
            {/* Info */}
            <div>
                Showing <span className="font-semibold text-body-main">{from}–{to}</span> of{' '}
                <span className="font-semibold text-body-main">{total}</span> {label}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1">
                {/* Prev */}
                {links[0]?.url ? (
                    <Link
                        href={links[0].url}
                        className="p-1.5 rounded-lg hover:bg-canvas-hover text-body-muted hover:text-body-main transition"
                        preserveScroll
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </Link>
                ) : (
                    <span className="p-1.5 rounded-lg opacity-30 cursor-not-allowed text-body-muted">
                        <ChevronLeft className="w-4 h-4" />
                    </span>
                )}

                {/* Page numbers (skip prev/next link entries) */}
                {links.slice(1, -1).map((link, i) => {
                    const label = link.label.replace('&laquo;', '').replace('&raquo;', '').trim();
                    if (label === '...') {
                        return (
                            <span key={i} className="px-2 py-1 text-body-subtle">…</span>
                        );
                    }
                    return link.url ? (
                        <Link
                            key={i}
                            href={link.url}
                            preserveScroll
                            className={`w-7 h-7 flex items-center justify-center rounded-lg font-medium transition ${
                                link.active
                                    ? 'bg-brand text-white font-semibold'
                                    : 'hover:bg-canvas-hover text-body-muted hover:text-body-main'
                            }`}
                        >
                            {label}
                        </Link>
                    ) : (
                        <span
                            key={i}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-body-subtle opacity-50"
                        >
                            {label}
                        </span>
                    );
                })}

                {/* Next */}
                {links[links.length - 1]?.url ? (
                    <Link
                        href={links[links.length - 1].url}
                        className="p-1.5 rounded-lg hover:bg-canvas-hover text-body-muted hover:text-body-main transition"
                        preserveScroll
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Link>
                ) : (
                    <span className="p-1.5 rounded-lg opacity-30 cursor-not-allowed text-body-muted">
                        <ChevronRight className="w-4 h-4" />
                    </span>
                )}
            </div>
        </div>
    );
}
