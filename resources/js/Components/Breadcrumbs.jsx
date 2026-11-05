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
        <nav aria-label="Breadcrumb" className={`flex items-center gap-2 text-xs ${className}`}>
            {backHref && (
                <Link
                    href={backHref}
                    className="p-1 rounded-md border border-gray-200 dark:border-[#26262D] bg-white dark:bg-[#15151A] text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition shrink-0"
                    title="Go back"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                </Link>
            )}

            <ol className="flex items-center gap-2 min-w-0 flex-wrap">
                {items.map((item, idx) => {
                    const isLast = idx === items.length - 1;

                    return (
                        <li key={idx} className="flex items-center gap-2 min-w-0">
                            {idx > 0 && (
                                <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 shrink-0" />
                            )}
                            {item.href && !isLast ? (
                                <Link
                                    href={item.href}
                                    className="font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition truncate max-w-[200px] sm:max-w-xs"
                                    title={item.label}
                                >
                                    {item.label}
                                </Link>
                            ) : (
                                <span
                                    className={`truncate max-w-[220px] sm:max-w-md ${
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

