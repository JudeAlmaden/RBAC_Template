import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import Pagination from '@/Components/Pagination';
import {
    Activity,
    History,
    Search,
    Eye,
    Terminal,
    X,
} from 'lucide-react';

/* ── Log badge helpers ───────────────────────────────────────── */
const ACTION_STYLES = {
    created:     'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50',
    updated:     'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800/50',
    deleted:     'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border-red-200 dark:border-red-800/50',
    promoted:    'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200 dark:border-purple-800/50',
    demoted:     'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800/50',
    transferred: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/50',
    activated:   'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 border-teal-200 dark:border-teal-800/50',
    deactivated: 'bg-canvas-muted text-body-muted border border-line',
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

function MetaCell({ metadata }) {
    if (!metadata || Object.keys(metadata).length === 0) {
        return <span className="text-gray-400">—</span>;
    }
    return (
        <div className="max-w-xs truncate text-[11px] text-gray-500 dark:text-gray-400 font-mono">
            {Object.entries(metadata).map(([k, v]) => `${k}: ${v}`).join(' · ')}
        </div>
    );
}

function LogTable({ logs, onInspect, search, onSearchChange, onSearchSubmit, placeholder, emptyText, columns, renderRow }) {
    return (
        <div className="bg-canvas-card rounded-xl border border-line shadow-sm overflow-hidden">
            <div className="p-4 border-b border-line flex items-center justify-between gap-4">
                <form onSubmit={onSearchSubmit} className="relative w-full max-w-sm">
                    <Search className="w-4 h-4 text-body-subtle absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder={placeholder}
                        className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-line bg-canvas-surface text-body-main placeholder-body-subtle focus:outline-none focus:ring-2 focus:ring-brand"
                    />
                </form>
                <span className="text-xs text-body-subtle font-mono shrink-0">{logs.total ?? 0} entries</span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                    <thead>
                        <tr className="border-b border-line bg-canvas-surface font-semibold text-body-muted uppercase tracking-wider text-[10px]">
                            {columns.map((col) => (
                                <th key={col} className={`py-3 px-4${col === 'Details' ? ' text-right' : ''}`}>{col}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-line text-body-muted">
                        {logs.data.length === 0 ? (
                            <tr><td colSpan={columns.length} className="py-10 text-center text-body-subtle">{emptyText}</td></tr>
                        ) : (
                            logs.data.map((log) => (
                                <tr key={log.id} className="hover:bg-canvas-hover transition">
                                    {renderRow(log)}
                                    <td className="py-3 px-4 text-right whitespace-nowrap">
                                        <button
                                            type="button"
                                            onClick={() => onInspect(log)}
                                            className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium text-body-muted hover:text-body-main hover:bg-canvas-hover transition border border-line"
                                        >
                                            <Eye className="w-3 h-3" />
                                            Inspect
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            {logs.links && logs.links.length > 3 && (
                <div className="p-4 border-t border-line">
                    <Pagination links={logs.links} />
                </div>
            )}
        </div>
    );
}

export default function UserActivitySection({ profileUser, logsBy, logsOn, filters = {} }) {
    const [activeTab, setActiveTab] = useState('by');
    const [bySearch, setBySearch] = useState(filters.by_search || '');
    const [onSearch, setOnSearch] = useState(filters.on_search || '');
    const [selectedLog, setSelectedLog] = useState(null);

    const handleBySearch = (e) => {
        e.preventDefault();
        router.get(
            route('users.show', profileUser.id),
            { by_search: bySearch, on_search: filters.on_search },
            { preserveState: true, replace: true }
        );
    };

    const handleOnSearch = (e) => {
        e.preventDefault();
        router.get(
            route('users.show', profileUser.id),
            { on_search: onSearch, by_search: filters.by_search },
            { preserveState: true, replace: true }
        );
    };

    return (
        <div className="space-y-4">
            <div className="flex border-b border-line">
                {[
                    { key: 'by', icon: Activity, label: 'Actions Performed By This User', count: logsBy?.total ?? 0 },
                    { key: 'on', icon: History, label: 'Changes Made To This User', count: logsOn?.total ?? 0 },
                ].map(({ key, icon: Icon, label, count }) => (
                    <button
                        key={key}
                        type="button"
                        onClick={() => setActiveTab(key)}
                        className={`py-3 px-5 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
                            activeTab === key
                                ? 'border-brand text-brand'
                                : 'border-transparent text-body-muted hover:text-body-main'
                        }`}
                    >
                        <Icon className="w-4 h-4" />
                        <span>{label}</span>
                        <span className="ml-1 px-1.5 rounded-full text-[10px] bg-canvas-muted text-body-muted">
                            {count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Log table helper */}
            {activeTab === 'by' && (
                <LogTable
                    logs={logsBy}
                    onInspect={setSelectedLog}
                    search={bySearch}
                    onSearchChange={setBySearch}
                    onSearchSubmit={handleBySearch}
                    placeholder="Search actions or subjects..."
                    emptyText="No actions recorded for this user yet."
                    columns={['Timestamp & IP', 'Action', 'Subject', 'Metadata', 'Details']}
                    renderRow={(log) => (
                        <>
                            <td className="py-3 px-4 whitespace-nowrap">
                                <div className="font-medium text-body-main">{log.created_at_human}</div>
                                <div className="text-[11px] text-body-subtle font-mono">
                                    {log.created_at_date}
                                    {log.ip_address && ` · ${log.ip_address}`}
                                </div>
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getActionBadge(log.action)}`}>
                                    {formatActionText(log.action)}
                                </span>
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                                <div className="font-medium text-body-main">{log.subject_name || '—'}</div>
                                <div className="text-[10px] text-body-subtle uppercase">
                                    {log.subject_type}
                                    {log.subject_id && ` #${log.subject_id}`}
                                </div>
                            </td>
                            <td className="py-3 px-4">
                                <MetaCell metadata={log.metadata} />
                            </td>
                        </>
                    )}
                />
            )}

            {activeTab === 'on' && (
                <LogTable
                    logs={logsOn}
                    onInspect={setSelectedLog}
                    search={onSearch}
                    onSearchChange={setOnSearch}
                    onSearchSubmit={handleOnSearch}
                    placeholder="Search by modifier or action..."
                    emptyText="No modification history recorded for this account."
                    columns={['Timestamp & IP', 'Actor (Modified By)', 'Action', 'Metadata', 'Details']}
                    renderRow={(log) => (
                        <>
                            <td className="py-3 px-4 whitespace-nowrap">
                                <div className="font-medium text-body-main">{log.created_at_human}</div>
                                <div className="text-[11px] text-body-subtle font-mono">
                                    {log.created_at_date}
                                    {log.ip_address && ` · ${log.ip_address}`}
                                </div>
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                                {log.actor_id ? (
                                    <Link href={route('users.show', log.actor_id)} className="font-medium text-brand hover:underline">
                                        {log.actor_name || `User #${log.actor_id}`}
                                    </Link>
                                ) : (
                                    <span className="text-body-muted">{log.actor_name || 'System'}</span>
                                )}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getActionBadge(log.action)}`}>
                                    {formatActionText(log.action)}
                                </span>
                            </td>
                            <td className="py-3 px-4">
                                <MetaCell metadata={log.metadata} />
                            </td>
                        </>
                    )}
                />
            )}

            {/* Log Inspector Modal */}
            <Modal show={Boolean(selectedLog)} onClose={() => setSelectedLog(null)} maxWidth="lg">
                {selectedLog && (
                    <div className="p-6">
                        <div className="flex items-center justify-between pb-4 border-b border-line">
                            <div className="flex items-center gap-2">
                                <Terminal className="w-4 h-4 text-brand" />
                                <h3 className="text-sm font-bold text-body-main">
                                    Log Entry #{selectedLog.id}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedLog(null)}
                                className="p-1 rounded-lg text-body-subtle hover:text-body-main transition"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="mt-4 space-y-4 text-xs">
                            <div className="grid grid-cols-2 gap-3 bg-canvas-surface p-3 rounded-lg border border-line">
                                {[
                                    ['Action', formatActionText(selectedLog.action)],
                                    ['Timestamp', selectedLog.created_at_date],
                                    ['Client IP', selectedLog.ip_address || 'N/A'],
                                    ['Relative Time', selectedLog.created_at_human],
                                ].map(([label, value]) => (
                                    <div key={label}>
                                        <span className="text-body-subtle block text-[10px] uppercase font-semibold">{label}</span>
                                        <span className="font-semibold text-body-main">{value}</span>
                                    </div>
                                ))}
                            </div>
                            <div>
                                <span className="text-body-subtle block text-[10px] uppercase font-semibold mb-1">Full Metadata</span>
                                <pre className="p-3 rounded-lg bg-gray-900 text-gray-100 font-mono text-[11px] overflow-x-auto max-h-52 border border-gray-800">
                                    {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0
                                        ? JSON.stringify(selectedLog.metadata, null, 2)
                                        : 'No additional metadata attached.'}
                                </pre>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setSelectedLog(null)}
                                className="px-4 py-2 rounded-lg text-xs font-semibold bg-canvas-surface text-body-muted hover:bg-canvas-hover hover:text-body-main transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
