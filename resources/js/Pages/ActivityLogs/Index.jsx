import React, { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Pagination from '@/Components/Pagination';
import Modal from '@/Components/Modal';
import {
    History,
    Search,
    Download,
    Filter,
    X,
    ShieldAlert,
    Calendar,
    Activity,
    Server,
    Globe,
    Terminal,
    Eye,
    Clock,
    User,
    Layers,
    FileText,
} from 'lucide-react';

const ACTION_STYLES = {
    created:      'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50',
    updated:      'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800/50',
    deleted:      'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border-red-200 dark:border-red-800/50',
    promoted:     'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200 dark:border-purple-800/50',
    demoted:      'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800/50',
    transferred:  'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/50',
    activated:    'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 border-teal-200 dark:border-teal-800/50',
    deactivated:  'bg-canvas-muted text-body-muted border border-line',
    system_init:  'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800/50',
};

function getActionBadge(action) {
    const key = (action ?? '').toLowerCase();
    for (const [k, v] of Object.entries(ACTION_STYLES)) {
        if (key.includes(k)) return v;
    }
    return 'bg-canvas-muted text-body-muted border border-line';
}

function formatActionText(action) {
    if (!action) return '—';
    return action.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function ActivityLogsIndex({
    logs,
    filters,
    availableActions = [],
    availableSubjectTypes = [],
    metrics = {},
}) {
    const [search, setSearch] = useState(filters.search || '');
    const [action, setAction] = useState(filters.action || '');
    const [subjectType, setSubjectType] = useState(filters.subject_type || '');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');

    // Metadata Inspector Modal
    const [selectedLog, setSelectedLog] = useState(null);

    const applyFilters = (overrides = {}) => {
        const query = {
            search,
            action,
            subject_type: subjectType,
            date_from: dateFrom,
            date_to: dateTo,
            ...overrides,
        };

        // Strip empty keys
        Object.keys(query).forEach((key) => {
            if (!query[key]) delete query[key];
        });

        router.get(route('activity-logs.index'), query, {
            preserveState: true,
            replace: true,
        });
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        applyFilters();
    };

    const handleReset = () => {
        setSearch('');
        setAction('');
        setSubjectType('');
        setDateFrom('');
        setDateTo('');
        router.get(route('activity-logs.index'));
    };

    const exportUrl = route('activity-logs.export', {
        search: filters.search || undefined,
        action: filters.action || undefined,
        subject_type: filters.subject_type || undefined,
        date_from: filters.date_from || undefined,
        date_to: filters.date_to || undefined,
    });

    const hasActiveFilters = Boolean(
        filters.search || filters.action || filters.subject_type || filters.date_from || filters.date_to
    );

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-body-main flex items-center gap-2">
                            <History className="w-5 h-5 text-brand" />
                            Audit & Activity Logs
                        </h2>
                        <p className="text-xs text-body-muted mt-0.5">
                            Real-time platform activity, role changes, privilege escalations, and system events
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <a
                            href={exportUrl}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold bg-canvas-card border border-line text-body-muted hover:text-body-main hover:bg-canvas-hover transition shadow-sm"
                        >
                            <Download className="w-3.5 h-3.5 text-body-subtle" />
                            Export CSV
                        </a>
                    </div>
                </div>
            }
        >
            <Head title="Audit & Activity Logs" />

            <div className="space-y-6">
                {/* ── Metric Cards ────────────────────────────────────────── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-canvas-card border border-line shadow-sm flex items-center justify-between">
                        <div>
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-body-subtle">
                                Total Log Entries
                            </span>
                            <div className="text-2xl font-bold text-body-main mt-1">
                                {metrics.total?.toLocaleString() ?? 0}
                            </div>
                            <span className="text-[11px] text-body-muted">
                                Retained immutable events
                            </span>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                            <History className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="p-4 rounded-xl bg-canvas-card border border-line shadow-sm flex items-center justify-between">
                        <div>
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-body-subtle">
                                Recorded Today
                            </span>
                            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                                {metrics.today?.toLocaleString() ?? 0}
                            </div>
                            <span className="text-[11px] text-body-muted">
                                Activity in past 24 hours
                            </span>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                            <Activity className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="p-4 rounded-xl bg-canvas-card border border-line shadow-sm flex items-center justify-between">
                        <div>
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-body-subtle">
                                Security / Privilege Actions
                            </span>
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                                {metrics.security?.toLocaleString() ?? 0}
                            </div>
                            <span className="text-[11px] text-body-muted">
                                Super Admin & Role mutations
                            </span>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                            <ShieldAlert className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* ── Filters Bar ─────────────────────────────────────────── */}
                <div className="p-4 rounded-xl bg-canvas-card border border-line shadow-sm space-y-3">
                    <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                        {/* Search Input */}
                        <div className="lg:col-span-2 relative">
                            <Search className="w-4 h-4 text-body-subtle absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search actor, subject, or action..."
                                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-line bg-canvas-surface text-body-main placeholder-body-subtle focus:outline-none focus:ring-2 focus:ring-brand"
                            />
                        </div>

                        {/* Action Filter */}
                        <div>
                            <select
                                value={action}
                                onChange={(e) => {
                                    setAction(e.target.value);
                                    applyFilters({ action: e.target.value });
                                }}
                                className="w-full py-2 px-3 text-xs rounded-lg border border-line bg-canvas-surface text-body-main focus:outline-none focus:ring-2 focus:ring-brand"
                            >
                                <option value="">All Actions</option>
                                {availableActions.map((act) => (
                                    <option key={act} value={act}>
                                        {formatActionText(act)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Subject Type Filter */}
                        <div>
                            <select
                                value={subjectType}
                                onChange={(e) => {
                                    setSubjectType(e.target.value);
                                    applyFilters({ subject_type: e.target.value });
                                }}
                                className="w-full py-2 px-3 text-xs rounded-lg border border-line bg-canvas-surface text-body-main focus:outline-none focus:ring-2 focus:ring-brand"
                            >
                                <option value="">All Subject Types</option>
                                {availableSubjectTypes.map((st) => (
                                    <option key={st} value={st}>
                                        {st}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Date From & Apply */}
                        <div className="flex items-center gap-2">
                            <button
                                type="submit"
                                className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-brand hover:bg-brand-hover text-white transition shadow-sm"
                            >
                                Filter
                            </button>
                            {hasActiveFilters && (
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="p-2 rounded-lg text-xs text-body-muted hover:text-body-main border border-line hover:bg-canvas-hover transition"
                                    title="Reset filters"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </form>

                    {/* Date range pickers */}
                    <div className="pt-2 border-t border-line flex flex-wrap items-center gap-3 text-xs text-body-muted">
                        <span className="flex items-center gap-1 font-medium">
                            <Calendar className="w-3.5 h-3.5 text-body-subtle" />
                            Date Range:
                        </span>
                        <div className="flex items-center gap-1.5">
                            <label className="text-[11px] text-body-subtle">From:</label>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => {
                                    setDateFrom(e.target.value);
                                    applyFilters({ date_from: e.target.value });
                                }}
                                className="py-1 px-2 text-xs rounded border border-line bg-canvas-surface text-body-main"
                            />
                        </div>
                        <div className="flex items-center gap-1.5">
                            <label className="text-[11px] text-body-subtle">To:</label>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => {
                                    setDateTo(e.target.value);
                                    applyFilters({ date_to: e.target.value });
                                }}
                                className="py-1 px-2 text-xs rounded border border-line bg-canvas-surface text-body-main"
                            />
                        </div>
                    </div>
                </div>

                {/* ── Table Container ─────────────────────────────────────── */}
                <div className="bg-canvas-card rounded-xl border border-line shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-line bg-canvas-surface font-semibold text-body-muted uppercase tracking-wider text-[10px]">
                                    <th className="py-3 px-4">Timestamp & IP</th>
                                    <th className="py-3 px-4">Actor</th>
                                    <th className="py-3 px-4">Action</th>
                                    <th className="py-3 px-4">Subject</th>
                                    <th className="py-3 px-4">Context Details</th>
                                    <th className="py-3 px-4 text-right">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-line text-body-muted">
                                {logs.data.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="py-14 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <History className="w-8 h-8 text-body-subtle mb-2" />
                                                <p className="font-semibold text-body-muted">
                                                    No activity logs found
                                                </p>
                                                <p className="text-xs text-body-subtle mt-0.5">
                                                    Try adjusting your search keywords or date filters.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    logs.data.map((log) => {
                                        const badgeClass = getActionBadge(log.action);
                                        return (
                                            <tr
                                                key={log.id}
                                                className="hover:bg-canvas-hover transition"
                                            >
                                                {/* Timestamp & IP */}
                                                <td className="py-3.5 px-4 whitespace-nowrap">
                                                    <div className="font-medium text-body-main flex items-center gap-1.5">
                                                        <Clock className="w-3 h-3 text-body-subtle" />
                                                        <span>{log.created_at_human}</span>
                                                    </div>
                                                    <div className="text-[11px] text-body-subtle font-mono mt-0.5 flex items-center gap-1">
                                                        <span>{log.created_at_date}</span>
                                                        {log.ip_address && (
                                                            <>
                                                                <span>·</span>
                                                                <span className="text-body-muted">{log.ip_address}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Actor */}
                                                <td className="py-3.5 px-4 whitespace-nowrap">
                                                    {log.actor_id ? (
                                                        <Link
                                                            href={route('users.show', log.actor_id)}
                                                            className="font-medium text-brand hover:underline flex items-center gap-1"
                                                        >
                                                            <User className="w-3 h-3" />
                                                            {log.actor_name || 'User #' + log.actor_id}
                                                        </Link>
                                                    ) : (
                                                        <span className="font-medium text-body-muted flex items-center gap-1">
                                                            <Server className="w-3 h-3 text-body-subtle" />
                                                            {log.actor_name || 'System'}
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Action */}
                                                <td className="py-3.5 px-4 whitespace-nowrap">
                                                    <span
                                                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badgeClass}`}
                                                    >
                                                        {formatActionText(log.action)}
                                                    </span>
                                                </td>

                                                {/* Subject */}
                                                <td className="py-3.5 px-4 whitespace-nowrap">
                                                    {log.subject_type ? (
                                                        <div>
                                                            <div className="font-medium text-body-main">
                                                                {log.subject_name || '—'}
                                                            </div>
                                                            <div className="text-[10px] text-body-subtle uppercase tracking-wider">
                                                                {log.subject_type}{' '}
                                                                {log.subject_id && `#${log.subject_id}`}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-body-subtle">—</span>
                                                    )}
                                                </td>

                                                {/* Context / Metadata Preview */}
                                                <td className="py-3.5 px-4">
                                                    {log.metadata && Object.keys(log.metadata).length > 0 ? (
                                                        <div className="max-w-xs truncate text-[11px] text-body-muted font-mono">
                                                            {Object.entries(log.metadata)
                                                                .map(([k, v]) => `${k}: ${v}`)
                                                                .join(' · ')}
                                                        </div>
                                                    ) : (
                                                        <span className="text-body-subtle text-[11px]">No extra context</span>
                                                    )}
                                                </td>

                                                {/* Action Button */}
                                                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                                    <button
                                                        onClick={() => setSelectedLog(log)}
                                                        className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium text-body-muted hover:text-body-main hover:bg-canvas-hover transition border border-line"
                                                    >
                                                        <Eye className="w-3 h-3" />
                                                        Inspect
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {logs.links && logs.links.length > 3 && (
                        <div className="p-4 border-t border-line">
                            <Pagination links={logs.links} />
                        </div>
                    )}
                </div>
            </div>

            {/* ── Metadata Inspector Modal ──────────────────────────────── */}
            <Modal show={Boolean(selectedLog)} onClose={() => setSelectedLog(null)} maxWidth="lg">
                {selectedLog && (
                    <div className="p-6">
                        <div className="flex items-center justify-between pb-4 border-b border-line">
                            <div className="flex items-center gap-2">
                                <Terminal className="w-4 h-4 text-brand" />
                                <h3 className="text-sm font-bold text-body-main">
                                    Log Entry Details #{selectedLog.id}
                                </h3>
                            </div>
                            <button
                                onClick={() => setSelectedLog(null)}
                                className="p-1 rounded-lg text-body-subtle hover:text-body-main transition"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="mt-4 space-y-4 text-xs">
                            <div className="grid grid-cols-2 gap-3 bg-canvas-surface p-3 rounded-lg border border-line">
                                <div>
                                    <span className="text-body-subtle block text-[10px] uppercase font-semibold">
                                        Action
                                    </span>
                                    <span className="font-semibold text-body-main">
                                        {formatActionText(selectedLog.action)}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-body-subtle block text-[10px] uppercase font-semibold">
                                        Timestamp
                                    </span>
                                    <span className="text-body-main">
                                        {selectedLog.created_at_date}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-body-subtle block text-[10px] uppercase font-semibold">
                                        Actor
                                    </span>
                                    <span className="text-body-main">
                                        {selectedLog.actor_name || 'System'}{' '}
                                        {selectedLog.actor_id && `(#${selectedLog.actor_id})`}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-body-subtle block text-[10px] uppercase font-semibold">
                                        Subject
                                    </span>
                                    <span className="text-body-main">
                                        {selectedLog.subject_name || 'None'}{' '}
                                        {selectedLog.subject_type && `(${selectedLog.subject_type})`}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-body-subtle block text-[10px] uppercase font-semibold">
                                        Client IP
                                    </span>
                                    <span className="font-mono text-body-main">
                                        {selectedLog.ip_address || 'N/A'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-body-subtle block text-[10px] uppercase font-semibold">
                                        Relative Time
                                    </span>
                                    <span className="text-body-main">
                                        {selectedLog.created_at_human}
                                    </span>
                                </div>
                            </div>

                            {/* User Agent */}
                            {selectedLog.user_agent && (
                                <div>
                                    <span className="text-body-subtle block text-[10px] uppercase font-semibold mb-1">
                                        User Agent
                                    </span>
                                    <div className="p-2.5 rounded bg-canvas-surface border border-line font-mono text-[11px] text-body-muted break-all">
                                        {selectedLog.user_agent}
                                    </div>
                                </div>
                            )}

                            {/* Metadata JSON */}
                            <div>
                                <span className="text-body-subtle block text-[10px] uppercase font-semibold mb-1">
                                    Full Metadata Payload
                                </span>
                                <pre className="p-3 rounded-lg bg-gray-900 text-gray-100 font-mono text-[11px] overflow-x-auto max-h-52 border border-gray-800">
                                    {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0
                                        ? JSON.stringify(selectedLog.metadata, null, 2)
                                        : 'No additional metadata attached.'}
                                </pre>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => setSelectedLog(null)}
                                className="px-4 py-2 rounded-lg text-xs font-semibold bg-canvas-surface text-body-muted hover:bg-canvas-hover hover:text-body-main transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </AuthenticatedLayout>
    );
}
