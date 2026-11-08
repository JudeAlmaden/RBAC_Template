import React from 'react';
import { Link } from '@inertiajs/react';
import { ChevronRight, ArrowLeft } from 'lucide-react';

/**
 * Reusable, accessible breadcrumbs navigation component.
 *
 * @param {Array<{ label: string, href?: string, truncate?: boolean }>} items
 * @param {string} [backHref] Optional back button URL (if provided, prepends an ArrowLeft icon button)
 * @param {string} [className]
 */
export default function Breadcrumbs({ items = [], backHref, className = '' }) {
    return (
        <nav aria-label="Breadcrumb" className={`flex min-w-0 items-center gap-2 overflow-hidden text-xs ${className}`}>
            {backHref && (
                <Link
                    href={backHref}
                    className="p-1 rounded-md border border-gray-200 dark:border-line bg-surface text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition shrink-0"
                    title="Go back"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                </Link>
            )}

            <ol className="flex min-w-0 flex-nowrap items-center gap-2 overflow-hidden">
                {items.map((item, idx) => {
                    const isLast = idx === items.length - 1;
                    // Keep the trail on one line: drop the middle crumbs on narrow screens.
                    const isCollapsibleMiddle = idx > 0 && !isLast && idx < items.length - 1;

                    return (
                        <li
                            key={idx}
                            className={`min-w-0 shrink items-center gap-2 ${isCollapsibleMiddle ? 'hidden lg:flex' : 'flex'}`}
                        >
                            {idx > 0 && (
                                <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 shrink-0" />
                            )}
                            {item.href && !isLast ? (
                                <Link
                                    href={item.href}
                                    className="max-w-[120px] truncate font-medium text-gray-500 transition hover:text-gray-900 sm:max-w-[160px] lg:max-w-[220px] dark:text-gray-400 dark:hover:text-white"
                                    title={item.label}
                                >
                                    {item.label}
                                </Link>
                            ) : (
                                <span
                                    className={`max-w-[140px] truncate sm:max-w-[220px] lg:max-w-[380px] ${
                                        isLast
                                            ? 'font-semibold text-gray-800 dark:text-gray-200'
                                            : 'font-medium text-gray-500 dark:text-gray-400'
                                    }`}
                                    title={item.label}
                                    aria-current={isLast ? 'page' : undefined}
                                >
                                    {item.label}
                                </span>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}

