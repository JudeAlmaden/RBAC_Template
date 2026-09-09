import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { History, User2, Activity, ChevronLeft, ChevronRight, Search, X } from 'lucide-react';

/* ─── Constants ─────────────────────────────────────────────────────────── */

const ACTION_STYLES = {
    created:      'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50',
    updated:      'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800/50',
    deleted:      'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border-red-200 dark:border-red-800/50',
    promoted:     'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200 dark:border-purple-800/50',
    demoted:      'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800/50',
    transferred:  'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/50',
    activated:    'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 border-teal-200 dark:border-teal-800/50',
    deactivated:  'bg-gray-100 text-gray-600 dark:bg-[#202028] dark:text-gray-400 border-gray-200 dark:border-[#2C2C38]',
};

const ACTION_OPTIONS = [
    { value: '',            label: 'All Actions' },
    { value: 'created',     label: 'Created' },
    { value: 'updated',     label: 'Updated' },
    { value: 'deleted',     label: 'Deleted' },
    { value: 'activated',   label: 'Activated' },
    { value: 'deactivated', label: 'Deactivated' },
    { value: 'promoted',    label: 'Promoted' },
    { value: 'demoted',     label: 'Demoted' },
    { value: 'transferred', label: 'Transferred' },
];

function getActionStyle(action) {
    const key = (action ?? '').toLowerCase();
    for (const [k, v] of Object.entries(ACTION_STYLES)) {
        if (key.includes(k)) return v;
    }
    return 'bg-gray-100 text-gray-600 dark:bg-[#202028] dark:text-gray-400 border-gray-200 dark:border-[#2C2C38]';
}

function formatAction(action) {
    if (!action) return '—';
    return action
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
}

function formatMeta(metadata) {
    if (!metadata || typeof metadata !== 'object') return null;
    const entries = Object.entries(metadata).filter(([, v]) => v !== null && v !== undefined && v !== '');
    if (entries.length === 0) return null;
    return entries
        .map(([k, v]) => {
            const label = k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
            return `${label}: ${v}`;
        })
        .join(' · ');
}

/* ─── Main Component ─────────────────────────────────────────────────────── */

/**
 * ActivityLogTable
 *
 * @param {Object}   logs           - Laravel LengthAwarePaginator object from Inertia
 * @param {string}   emptyLabel     - Message shown when there are no logs
 * @param {string}   logRouteKey    - Named route to hit when changing page/filters (e.g. 'users.index')
 * @param {Object}   currentFilters - Current filters from page props (log_search, log_action)
 * @param {Object}   preserveParams - Extra query params to preserve (e.g. { search, role })
 */
export default function ActivityLogTable({
    logs = null,
    emptyLabel = 'No activity recorded yet.',
    logRouteKey,
    currentFilters = {},
    preserveParams = {},
}) {
    const [search, setSearch] = useState(currentFilters.log_search || '');
    const [actionFilter, setActionFilter] = useState(currentFilters.log_action || '');

    // Sync local state if parent props change (e.g. on navigation)
    useEffect(() => {
        setSearch(currentFilters.log_search || '');
        setActionFilter(currentFilters.log_action || '');
    }, [currentFilters.log_search, currentFilters.log_action]);

    // Immediate server request when action filter changes
    useEffect(() => {
        fireFilter({ log_search: currentFilters.log_search || '', log_action: actionFilter, log_page: 1 });
    }, [actionFilter]);

    const fireFilter = (overrides = {}) => {
        if (!logRouteKey) return;
        router.get(
            route(logRouteKey),
            { ...preserveParams, ...overrides },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const submitSearch = () => {
        fireFilter({ log_search: search, log_action: actionFilter, log_page: 1 });
    };

    const goToPage = (url) => {
        if (!url) return;
        router.get(url, {}, { preserveState: true, preserveScroll: true });
    };

    const hasFilters = Boolean(search || actionFilter);
    const clearFilters = () => {
        setSearch('');
        setActionFilter('');
        fireFilter({ log_search: '', log_action: '', log_page: 1 });
    };

    // Support both paginator object and null (no permission)
    const paginator = logs && typeof logs === 'object' && !Array.isArray(logs) ? logs : null;
    const logList   = paginator?.data ?? [];
    const total     = paginator?.total ?? 0;
    const from      = paginator?.from ?? 0;
    const to        = paginator?.to ?? 0;
    const links     = paginator?.links ?? [];
    const prevUrl   = paginator?.prev_page_url ?? null;
    const nextUrl   = paginator?.next_page_url ?? null;
    const lastPage  = paginator?.last_page ?? 1;
    const curPage   = paginator?.current_page ?? 1;

    /* ── Toolbar ─────────────────────────────────────────────────────────── */

    const toolbar = logRouteKey ? (
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 px-4 py-3 border-b border-[#E8E8EC] dark:border-[#26262D] bg-[#FAFAFC] dark:bg-[#1C1C24]">
            {/* Search input + button */}
            <div className="flex items-center gap-1.5 flex-1 min-w-0 sm:max-w-xs">
                <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && submitSearch()}
                        placeholder="Search by name or subject…"
                        className="w-full pl-8 pr-8 py-1.5 text-xs bg-white dark:bg-[#15151A] border border-[#E8E8EC] dark:border-[#26262D] rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-[#5B5FC7] focus:outline-none transition"
                    />
                    {search && (
                        <button onClick={() => { setSearch(''); fireFilter({ log_search: '', log_action: actionFilter, log_page: 1 }); }} className="absolute right-2.5 top-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition">
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
                <button
                    type="button"
                    onClick={submitSearch}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#5B5FC7] hover:bg-[#484CB8] text-white transition shrink-0"
                >
                    <Search className="w-3 h-3" />
                    Search
                </button>
            </div>

            {/* Action pills */}
            <div className="flex flex-wrap gap-1">
                {ACTION_OPTIONS.map((opt) => {
                    const active = actionFilter === opt.value;
                    return (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => setActionFilter(opt.value)}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition border ${
                                active
                                    ? 'bg-[#5B5FC7] border-[#5B5FC7] text-white shadow-sm'
                                    : 'bg-white dark:bg-[#15151A] border-[#E8E8EC] dark:border-[#26262D] text-gray-600 dark:text-gray-400 hover:border-[#5B5FC7]/50 hover:text-[#5B5FC7] dark:hover:text-[#8A8DE2]'
                            }`}
                        >
                            {opt.label}
                        </button>
                    );
                })}
            </div>

            {/* Clear */}
            {hasFilters && (
                <button
                    type="button"
                    onClick={clearFilters}
                    className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition whitespace-nowrap"
                >
                    <X className="w-3 h-3" /> Clear
                </button>
            )}
        </div>
    ) : null;

    /* ── Empty state ─────────────────────────────────────────────────────── */

    if (logList.length === 0) {
        return (
            <div>
                {toolbar}
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-[#202028] flex items-center justify-center mb-3">
                        <History className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                    </div>
                    {hasFilters ? (
                        <>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No matching activity records</p>
                            <button onClick={clearFilters} className="mt-2 text-xs text-[#5B5FC7] hover:underline">Clear filters</button>
                        </>
                    ) : (
                        <>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{emptyLabel}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Actions performed here will be tracked automatically.</p>
                        </>
                    )}
                </div>
            </div>
        );
    }

    /* ── Table + pagination ─────────────────────────────────────────────── */

    return (
        <div>
            {toolbar}

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                    <thead>
                        <tr className="border-b border-[#E8E8EC] dark:border-[#26262D] bg-[#FAFAFC] dark:bg-[#1C1C24] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[10px]">
                            <th className="py-3 px-5 w-[22%]">Timestamp</th>
                            <th className="py-3 px-5 w-[20%]">Performed By</th>
                            <th className="py-3 px-5 w-[14%]">Action</th>
                            <th className="py-3 px-5 w-[20%]">Subject</th>
                            <th className="py-3 px-5">Details</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8E8EC] dark:divide-[#26262D] text-gray-700 dark:text-gray-300">
                        {logList.map((log) => {
                            const meta = formatMeta(log.metadata);
                            return (
                                <tr key={log.id} className="hover:bg-gray-50/60 dark:hover:bg-[#1C1C24]/50 transition">
                                    {/* Timestamp */}
                                    <td className="py-3.5 px-5 whitespace-nowrap">
                                        <div className="text-xs text-gray-700 dark:text-gray-300 font-medium">{log.created_at_human}</div>
                                        <div className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{log.created_at_date}</div>
                                    </td>

                                    {/* Actor */}
                                    <td className="py-3.5 px-5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-[#5B5FC7]/10 dark:bg-[#5B5FC7]/20 flex items-center justify-center shrink-0">
                                                <User2 className="w-3.5 h-3.5 text-[#5B5FC7] dark:text-[#8A8DE2]" />
                                            </div>
                                            <span className="font-medium text-gray-800 dark:text-gray-200 truncate max-w-[120px]">
                                                {log.actor_name ?? <span className="text-gray-400 italic">Deleted User</span>}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Action Badge */}
                                    <td className="py-3.5 px-5 whitespace-nowrap">
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${getActionStyle(log.action)}`}>
                                            <Activity className="w-2.5 h-2.5 opacity-70" />
                                            {formatAction(log.action)}
                                        </span>
                                    </td>

                                    {/* Subject */}
                                    <td className="py-3.5 px-5">
                                        {log.subject_name ? (
                                            <div>
                                                <div className="font-medium text-gray-800 dark:text-gray-200 truncate max-w-[140px]">{log.subject_name}</div>
                                                {log.subject_type && (
                                                    <div className="text-[11px] text-gray-400 mt-0.5">{log.subject_type}</div>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-gray-400">—</span>
                                        )}
                                    </td>

                                    {/* Metadata */}
                                    <td className="py-3.5 px-5 text-[11px] text-gray-500 dark:text-gray-400">
                                        {meta ?? <span className="text-gray-300 dark:text-gray-600">—</span>}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Pagination footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 border-t border-[#E8E8EC] dark:border-[#26262D] text-xs text-gray-500 dark:text-gray-400">
                <div>
                    {total > 0 ? (
                        <>
                            Showing{' '}
                            <span className="font-semibold text-gray-700 dark:text-gray-200">{from}–{to}</span>{' '}
                            of{' '}
                            <span className="font-semibold text-gray-700 dark:text-gray-200">{total}</span>{' '}
                            activity records
                            {hasFilters && <span className="ml-1 text-gray-400">(filtered)</span>}
                        </>
                    ) : (
                        'No records'
                    )}
                </div>

                {lastPage > 1 && (
                    <div className="flex items-center gap-1">
                        {/* Prev */}
                        <button
                            type="button"
                            onClick={() => goToPage(prevUrl)}
                            disabled={!prevUrl}
                            className={`p-1.5 rounded-lg transition ${
                                !prevUrl
                                    ? 'opacity-30 cursor-not-allowed'
                                    : 'hover:bg-gray-100 dark:hover:bg-[#1F1F26] text-gray-700 dark:text-gray-300'
                            }`}
                            title="Previous page"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>

                        {/* Page numbers from Laravel links (skip first/last "Previous"/"Next" labels) */}
                        {links.slice(1, -1).map((link, i) => {
                            const isDots = link.label === '...';
                            if (isDots) return <span key={i} className="px-2 py-1 text-gray-400">…</span>;
                            const isActive = link.active;
                            return (
                                <button
                                    type="button"
                                    key={i}
                                    onClick={() => goToPage(link.url)}
                                    className={`w-7 h-7 flex items-center justify-center rounded-lg font-medium transition ${
                                        isActive
                                            ? 'bg-[#5B5FC7] text-white'
                                            : 'hover:bg-gray-100 dark:hover:bg-[#1F1F26] text-gray-700 dark:text-gray-300'
                                    }`}
                                >
                                    {link.label}
                                </button>
                            );
                        })}

                        {/* Next */}
                        <button
                            type="button"
                            onClick={() => goToPage(nextUrl)}
                            disabled={!nextUrl}
                            className={`p-1.5 rounded-lg transition ${
                                !nextUrl
                                    ? 'opacity-30 cursor-not-allowed'
                                    : 'hover:bg-gray-100 dark:hover:bg-[#1F1F26] text-gray-700 dark:text-gray-300'
                            }`}
                            title="Next page"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
