import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, Link } from '@inertiajs/react';
import Pagination from '@/Components/Pagination';
import {
    Bell,
    BellOff,
    CheckCheck,
    Check,
    Trash2,
    X,
    Search,
    ExternalLink,
    Shield,
    ShieldMinus,
    Award,
    ArrowRightLeft,
    Info,
    CheckCircle2,
    AlertTriangle,
    AlertCircle,
    User,
    Sparkles,
} from 'lucide-react';

/* ─── Icon map (matches icon strings stored in DB) ───────────────────── */

const ICON_MAP = {
    Award,
    ArrowRightLeft,
    ShieldMinus,
    Shield,
    Info,
    CheckCircle2,
    AlertTriangle,
    AlertCircle,
    Bell,
};

const SEVERITY_STYLES = {
    success: {
        icon: 'text-emerald-500',
        dot: 'bg-emerald-500',
        ring: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50',
        badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
    },
    warning: {
        icon: 'text-amber-500',
        dot: 'bg-amber-500',
        ring: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50',
        badge: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800/60',
    },
    danger: {
        icon: 'text-red-500',
        dot: 'bg-red-500',
        ring: 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-800/50',
        badge: 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300 border-red-200 dark:border-red-800/60',
    },
    info: {
        icon: 'text-[#5B5FC7] dark:text-[#8A8DE2]',
        dot: 'bg-[#5B5FC7]',
        ring: 'bg-[#5B5FC7]/10 text-[#5B5FC7] dark:bg-[#5B5FC7]/20 dark:text-[#8A8DE2] border border-[#5B5FC7]/20',
        badge: 'bg-[#5B5FC7]/10 text-[#5B5FC7] dark:bg-[#5B5FC7]/20 dark:text-[#8A8DE2] border-[#5B5FC7]/20',
    },
};

export default function NotificationsIndex({ notifications, unread_count = 0, counts = {}, filters = {} }) {
    const [searchInput, setSearchInput] = useState(filters.search || '');

    const currentFilter = filters.filter || 'all';
    const currentSeverity = filters.severity || '';

    const applyFilter = (params = {}) => {
        const merged = {
            filter: currentFilter,
            severity: currentSeverity,
            search: searchInput,
            ...params,
        };

        // Clean empty params
        const clean = {};
        if (merged.filter && merged.filter !== 'all') clean.filter = merged.filter;
        if (merged.severity) clean.severity = merged.severity;
        if (merged.search && merged.search.trim()) clean.search = merged.search.trim();

        router.get(route('notifications.index'), clean, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSearchSubmit = (e) => {
        if (e) e.preventDefault();
        applyFilter({ search: searchInput });
    };

    const handleClearSearch = () => {
        setSearchInput('');
        applyFilter({ search: '' });
    };

    const handleTabChange = (tab) => {
        applyFilter({ filter: tab });
    };

    const handleSeverityChange = (sev) => {
        applyFilter({ severity: sev === currentSeverity ? '' : sev });
    };

    const handleMarkRead = (id) => {
        router.patch(route('notifications.read', id), {}, {
            preserveScroll: true,
        });
    };

    const handleMarkAllRead = () => {
        router.patch(route('notifications.read-all'), {}, {
            preserveScroll: true,
        });
    };

    const handleClearRead = () => {
        if (confirm('Dismiss all read notifications? This action cannot be undone.')) {
            router.delete(route('notifications.clear-read'), {
                preserveScroll: true,
            });
        }
    };

    const handleDismiss = (id) => {
        router.delete(route('notifications.destroy', id), {
            preserveScroll: true,
        });
    };

    const items = notifications?.data ?? [];
    const hasUnread = (counts.unread ?? unread_count) > 0;
    const hasRead = (counts.read ?? 0) > 0;

    return (
        <AuthenticatedLayout>
            <Head title="Notifications" />

            <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                {/* Header Card */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#15151A] p-6 rounded-2xl border border-[#E8E8EC] dark:border-[#26262D] shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#5B5FC7]/10 dark:bg-[#5B5FC7]/20 flex items-center justify-center text-[#5B5FC7] dark:text-[#8A8DE2] flex-shrink-0">
                            <Bell className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                                    Notifications
                                </h1>
                                {unread_count > 0 && (
                                    <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-[#5B5FC7] text-white">
                                        {unread_count} unread
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Stay informed about account updates, security alerts, and role assignments.
                            </p>
                        </div>
                    </div>

                    {/* Bulk Actions */}
                    <div className="flex items-center gap-2 self-start sm:self-center">
                        {hasUnread && (
                            <button
                                onClick={handleMarkAllRead}
                                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg text-[#5B5FC7] dark:text-[#8A8DE2] bg-[#5B5FC7]/10 dark:bg-[#5B5FC7]/20 hover:bg-[#5B5FC7]/15 dark:hover:bg-[#5B5FC7]/25 transition"
                            >
                                <CheckCheck className="w-3.5 h-3.5" />
                                Mark all read
                            </button>
                        )}
                        {hasRead && (
                            <button
                                onClick={handleClearRead}
                                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-[#1F1F26] hover:bg-gray-200 dark:hover:bg-[#282834] transition"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                Clear read
                            </button>
                        )}
                    </div>
                </div>

                {/* Filter & Search Bar */}
                <div className="bg-white dark:bg-[#15151A] p-4 rounded-2xl border border-[#E8E8EC] dark:border-[#26262D] shadow-sm space-y-3">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        {/* Status Tabs */}
                        <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-[#1F1F26] p-1 rounded-xl">
                            {[
                                { key: 'all', label: 'All', count: counts.all },
                                { key: 'unread', label: 'Unread', count: counts.unread },
                                { key: 'read', label: 'Read', count: counts.read },
                            ].map((tab) => {
                                const isActive = currentFilter === tab.key;
                                return (
                                    <button
                                        key={tab.key}
                                        onClick={() => handleTabChange(tab.key)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                                            isActive
                                                ? 'bg-white dark:bg-[#15151A] text-gray-900 dark:text-white shadow-sm font-semibold'
                                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                        }`}
                                    >
                                        <span>{tab.label}</span>
                                        {tab.count !== undefined && (
                                            <span
                                                className={`px-1.5 py-0.2 text-[10px] rounded-full ${
                                                    isActive
                                                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                                                        : 'bg-gray-200/70 dark:bg-gray-800/80 text-gray-600 dark:text-gray-400'
                                                }`}
                                            >
                                                {tab.count}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Search Bar with Submit Button & Clear Button */}
                        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-md w-full md:w-auto">
                            <div className="relative flex-1">
                                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <input
                                    type="text"
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleSearchSubmit(e);
                                        }
                                    }}
                                    placeholder="Search notifications…"
                                    className="w-full pl-9 pr-8 py-1.5 text-xs rounded-xl bg-gray-50 dark:bg-[#1A1A22] border border-gray-200 dark:border-[#26262D] text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-[#5B5FC7] focus:border-[#5B5FC7]"
                                />
                                {searchInput && (
                                    <button
                                        type="button"
                                        onClick={handleClearSearch}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                            <button
                                type="submit"
                                className="px-3 py-1.5 bg-[#5B5FC7] hover:bg-[#4A4EB5] text-white text-xs font-semibold rounded-xl transition"
                            >
                                Search
                            </button>
                        </form>
                    </div>

                    {/* Severity Filters */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-gray-100 dark:border-[#26262D]">
                        <span className="text-[11px] font-medium text-gray-400 mr-1">Severity:</span>
                        {[
                            { key: '', label: 'All' },
                            { key: 'info', label: 'Info' },
                            { key: 'success', label: 'Success' },
                            { key: 'warning', label: 'Warning' },
                            { key: 'danger', label: 'Danger' },
                        ].map((s) => {
                            const isSelected = currentSeverity === s.key;
                            return (
                                <button
                                    key={s.key}
                                    onClick={() => handleSeverityChange(s.key)}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                                        isSelected
                                            ? 'bg-[#5B5FC7] text-white'
                                            : 'bg-gray-100 dark:bg-[#1E1E26] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#282834]'
                                    }`}
                                >
                                    {s.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Notifications List Card */}
                <div className="bg-white dark:bg-[#15151A] rounded-2xl border border-[#E8E8EC] dark:border-[#26262D] shadow-sm overflow-hidden divide-y divide-[#E8E8EC] dark:divide-[#26262D]">
                    {items.length === 0 ? (
                        <div className="py-16 px-4 text-center">
                            <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-[#1F1F26] flex items-center justify-center text-gray-400 mx-auto mb-3">
                                <BellOff className="w-6 h-6" />
                            </div>
                            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                No notifications found
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
                                {currentFilter !== 'all' || currentSeverity || searchInput
                                    ? 'No notifications match your current filters. Try resetting the filters to see more.'
                                    : 'You have no notifications at this time.'}
                            </p>
                            {(currentFilter !== 'all' || currentSeverity || searchInput) && (
                                <button
                                    onClick={() => {
                                        setSearchInput('');
                                        router.get(route('notifications.index'));
                                    }}
                                    className="mt-4 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-gray-100 dark:bg-[#1F1F26] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#2A2A35] transition"
                                >
                                    Clear all filters
                                </button>
                            )}
                        </div>
                    ) : (
                        items.map((notification) => {
                            const styles = SEVERITY_STYLES[notification.severity] ?? SEVERITY_STYLES.info;
                            const IconComponent = ICON_MAP[notification.icon] ?? Info;

                            return (
                                <div
                                    key={notification.id}
                                    className={`relative p-5 transition group ${
                                        !notification.is_read
                                            ? 'bg-[#5B5FC7]/[0.025] dark:bg-[#5B5FC7]/[0.04]'
                                            : 'hover:bg-gray-50/70 dark:hover:bg-[#1A1A22]'
                                    }`}
                                >
                                    {/* Unread indicator vertical strip */}
                                    {!notification.is_read && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#5B5FC7]" />
                                    )}

                                    <div className="flex items-start gap-4">
                                        {/* Icon Badge */}
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${styles.ring}`}>
                                            <IconComponent className={`w-5 h-5 ${styles.icon}`} />
                                        </div>

                                        {/* Main Content Area */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <div className="flex items-center gap-2.5 flex-wrap">
                                                    <span className={`text-sm font-semibold ${
                                                        notification.is_read
                                                            ? 'text-gray-700 dark:text-gray-300'
                                                            : 'text-gray-900 dark:text-white font-bold'
                                                    }`}>
                                                        {notification.title}
                                                    </span>

                                                    {/* Severity Badge */}
                                                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${styles.badge} uppercase tracking-wider`}>
                                                        {notification.severity}
                                                    </span>

                                                    {/* Unread Pill */}
                                                    {!notification.is_read && (
                                                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#5B5FC7] text-white">
                                                            NEW
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Timestamp */}
                                                <span
                                                    className="text-xs text-gray-400 flex-shrink-0"
                                                    title={notification.created_at_formatted}
                                                >
                                                    {notification.created_at}
                                                </span>
                                            </div>

                                            {/* Body */}
                                            {notification.body && (
                                                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1.5 leading-relaxed">
                                                    {notification.body}
                                                </p>
                                            )}

                                            {/* Metadata & Actions row */}
                                            <div className="flex flex-wrap items-center justify-between gap-3 mt-3.5 pt-2 border-t border-gray-100/80 dark:border-[#26262D]">
                                                <div className="flex items-center gap-3 text-xs text-gray-400">
                                                    {notification.sender_name ? (
                                                        <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                                                            <User className="w-3.5 h-3.5 text-gray-400" />
                                                            {notification.sender_name}
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1 text-gray-400">
                                                            <Sparkles className="w-3 h-3 text-gray-400" />
                                                            System
                                                        </span>
                                                    )}

                                                    {notification.created_at_formatted && (
                                                        <>
                                                            <span className="text-gray-300 dark:text-gray-700">·</span>
                                                            <span className="text-[11px] text-gray-400 hidden sm:inline">
                                                                {notification.created_at_formatted}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex items-center gap-2">
                                                    {notification.action_url && (
                                                        <Link
                                                            href={notification.action_url}
                                                            onClick={() => {
                                                                if (!notification.is_read) {
                                                                    handleMarkRead(notification.id);
                                                                }
                                                            }}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-[#5B5FC7] dark:text-[#8A8DE2] hover:bg-[#5B5FC7]/10 dark:hover:bg-[#5B5FC7]/20 rounded-lg transition"
                                                        >
                                                            <span>{notification.action_label || 'View'}</span>
                                                            <ExternalLink className="w-3 h-3" />
                                                        </Link>
                                                    )}

                                                    {!notification.is_read && (
                                                        <button
                                                            onClick={() => handleMarkRead(notification.id)}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-lg transition"
                                                            title="Mark as read"
                                                        >
                                                            <Check className="w-3 h-3" />
                                                            <span className="hidden sm:inline">Mark read</span>
                                                        </button>
                                                    )}

                                                    <button
                                                        onClick={() => handleDismiss(notification.id)}
                                                        className="p-1 rounded-lg text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                                                        title="Dismiss notification"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}

                    {/* Pagination Footer */}
                    <Pagination paginator={notifications} label="notifications" />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
