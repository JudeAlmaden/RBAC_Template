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
    deactivated: 'bg-gray-100 text-gray-600 dark:bg-[#202028] dark:text-gray-400 border-gray-200 dark:border-[#2C2C38]',
};

function getActionBadge(action) {
    const key = (action ?? '').toLowerCase();
    for (const [k, v] of Object.entries(ACTION_STYLES)) {
        if (key.includes(k)) return v;
    }
    return 'bg-gray-100 text-gray-700 dark:bg-[#202028] dark:text-gray-300 border-gray-200 dark:border-[#2C2C38]';
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
        <div className="bg-white dark:bg-[#15151A] rounded-xl border border-[#E8E8EC] dark:border-[#26262D] shadow-sm overflow-hidden">
            <div className="p-4 border-b border-[#E8E8EC] dark:border-[#22222B] flex items-center justify-between gap-4">
                <form onSubmit={onSearchSubmit} className="relative w-full max-w-sm">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder={placeholder}
                        className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-[#E8E8EC] dark:border-[#2A2A35] bg-gray-50 dark:bg-[#1A1A22] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#5B5FC7]"
                    />
                </form>
                <span className="text-xs text-gray-400 font-mono shrink-0">{logs.total ?? 0} entries</span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                    <thead>
                        <tr className="border-b border-[#E8E8EC] dark:border-[#26262D] bg-[#FAFAFC] dark:bg-[#1C1C24] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[10px]">
                            {columns.map((col) => (
                                <th key={col} className={`py-3 px-4${col === 'Details' ? ' text-right' : ''}`}>{col}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8E8EC] dark:divide-[#26262D] text-gray-700 dark:text-gray-300">
                        {logs.data.length === 0 ? (
                            <tr><td colSpan={columns.length} className="py-10 text-center text-gray-400">{emptyText}</td></tr>
                        ) : (
                            logs.data.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-50/60 dark:hover:bg-[#1C1C24]/50 transition">
                                    {renderRow(log)}
                                    <td className="py-3 px-4 text-right whitespace-nowrap">
                                        <button
                                            type="button"
                                            onClick={() => onInspect(log)}
                                            className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#252530] transition border border-[#E8E8EC] dark:border-[#2A2A35]"
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
                <div className="p-4 border-t border-[#E8E8EC] dark:border-[#26262D]">
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
            <div className="flex border-b border-[#E8E8EC] dark:border-[#26262D]">
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
                                ? 'border-[#5B5FC7] text-[#5B5FC7] dark:text-[#8A8DE2]'
                                : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'
                        }`}
                    >
                        <Icon className="w-4 h-4" />
                        <span>{label}</span>
                        <span className="ml-1 px-1.5 rounded-full text-[10px] bg-gray-100 dark:bg-[#252530] text-gray-600 dark:text-gray-400">
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
                                <div className="font-medium text-gray-900 dark:text-gray-100">{log.created_at_human}</div>
                                <div className="text-[11px] text-gray-400 font-mono">
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
                                <div className="font-medium text-gray-900 dark:text-gray-100">{log.subject_name || '—'}</div>
                                <div className="text-[10px] text-gray-400 uppercase">
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
                                <div className="font-medium text-gray-900 dark:text-gray-100">{log.created_at_human}</div>
                                <div className="text-[11px] text-gray-400 font-mono">
                                    {log.created_at_date}
                                    {log.ip_address && ` · ${log.ip_address}`}
                                </div>
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                                {log.actor_id ? (
                                    <Link href={route('users.show', log.actor_id)} className="font-medium text-[#5B5FC7] dark:text-[#8A8DE2] hover:underline">
                                        {log.actor_name || `User #${log.actor_id}`}
                                    </Link>
                                ) : (
                                    <span className="text-gray-500">{log.actor_name || 'System'}</span>
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
                        <div className="flex items-center justify-between pb-4 border-b border-[#E8E8EC] dark:border-[#26262D]">
                            <div className="flex items-center gap-2">
                                <Terminal className="w-4 h-4 text-[#5B5FC7]" />
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                                    Log Entry #{selectedLog.id}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedLog(null)}
                                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="mt-4 space-y-4 text-xs">
                            <div className="grid grid-cols-2 gap-3 bg-gray-50 dark:bg-[#1A1A22] p-3 rounded-lg border border-[#E8E8EC] dark:border-[#2A2A35]">
                                {[
                                    ['Action', formatActionText(selectedLog.action)],
                                    ['Timestamp', selectedLog.created_at_date],
                                    ['Client IP', selectedLog.ip_address || 'N/A'],
                                    ['Relative Time', selectedLog.created_at_human],
                                ].map(([label, value]) => (
                                    <div key={label}>
                                        <span className="text-gray-400 block text-[10px] uppercase font-semibold">{label}</span>
                                        <span className="font-semibold text-gray-800 dark:text-gray-200">{value}</span>
                                    </div>
                                ))}
                            </div>
                            <div>
                                <span className="text-gray-400 block text-[10px] uppercase font-semibold mb-1">Full Metadata</span>
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
                                className="px-4 py-2 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-[#252530] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#30303E] transition"
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
