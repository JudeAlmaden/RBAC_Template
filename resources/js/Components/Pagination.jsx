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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 border-t border-[#E8E8EC] dark:border-[#26262D] text-xs text-gray-500 dark:text-gray-400">
            {/* Info */}
            <div>
                Showing <span className="font-semibold text-gray-700 dark:text-gray-200">{from}–{to}</span> of{' '}
                <span className="font-semibold text-gray-700 dark:text-gray-200">{total}</span> {label}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1">
                {/* Prev */}
                {links[0]?.url ? (
                    <Link
                        href={links[0].url}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1F1F26] transition"
                        preserveScroll
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </Link>
                ) : (
                    <span className="p-1.5 rounded-lg opacity-30 cursor-not-allowed">
                        <ChevronLeft className="w-4 h-4" />
                    </span>
                )}

                {/* Page numbers (skip prev/next link entries) */}
                {links.slice(1, -1).map((link, i) => {
                    const label = link.label.replace('&laquo;', '').replace('&raquo;', '').trim();
                    if (label === '...') {
                        return (
                            <span key={i} className="px-2 py-1 text-gray-400">…</span>
                        );
                    }
                    return link.url ? (
                        <Link
                            key={i}
                            href={link.url}
                            preserveScroll
                            className={`w-7 h-7 flex items-center justify-center rounded-lg font-medium transition ${
                                link.active
                                    ? 'bg-[#5B5FC7] text-white'
                                    : 'hover:bg-gray-100 dark:hover:bg-[#1F1F26] text-gray-700 dark:text-gray-300'
                            }`}
                        >
                            {label}
                        </Link>
                    ) : (
                        <span
                            key={i}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 opacity-50"
                        >
                            {label}
                        </span>
                    );
                })}

                {/* Next */}
                {links[links.length - 1]?.url ? (
                    <Link
                        href={links[links.length - 1].url}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1F1F26] transition"
                        preserveScroll
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Link>
                ) : (
                    <span className="p-1.5 rounded-lg opacity-30 cursor-not-allowed">
                        <ChevronRight className="w-4 h-4" />
                    </span>
                )}
            </div>
        </div>
    );
}
