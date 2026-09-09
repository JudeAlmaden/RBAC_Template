import React, { useState, useEffect, useRef } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import {
    Bell,
    X,
    Award,
    ArrowRightLeft,
    ArrowRight,
    ShieldMinus,
    Shield,
    Info,
    CheckCircle2,
    AlertTriangle,
    AlertCircle,
    CheckCheck,
    ExternalLink,
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
};

const SEVERITY_STYLES = {
    success: {
        icon:   'text-emerald-500',
        dot:    'bg-emerald-500',
        ring:   'bg-emerald-50 dark:bg-emerald-950/40',
    },
    warning: {
        icon:   'text-amber-500',
        dot:    'bg-amber-500',
        ring:   'bg-amber-50 dark:bg-amber-950/40',
    },
    danger: {
        icon:   'text-red-500',
        dot:    'bg-red-500',
        ring:   'bg-red-50 dark:bg-red-950/40',
    },
    info: {
        icon:   'text-[#5B5FC7]',
        dot:    'bg-[#5B5FC7]',
        ring:   'bg-[#5B5FC7]/10 dark:bg-[#5B5FC7]/20',
    },
};

/* ─── Single notification row ─────────────────────────────────────────── */

function NotificationRow({ notification, onRead, onDismiss }) {
    const styles  = SEVERITY_STYLES[notification.severity] ?? SEVERITY_STYLES.info;
    const Icon    = ICON_MAP[notification.icon] ?? Info;

    const handleClick = () => {
        if (!notification.is_read) onRead(notification.id);
        if (notification.action_url) router.visit(notification.action_url);
    };

    return (
        <div className={`relative flex gap-3 px-4 py-3.5 transition group ${
            !notification.is_read
                ? 'bg-[#5B5FC7]/[0.03] dark:bg-[#5B5FC7]/[0.06]'
                : ''
        } hover:bg-gray-50 dark:hover:bg-[#1E1E26]`}>

            {/* Unread dot */}
            {!notification.is_read && (
                <div className={`absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full ${styles.dot}`} />
            )}

            {/* Icon */}
            <div className={`w-8 h-8 flex-shrink-0 rounded-lg flex items-center justify-center ${styles.ring}`}>
                <Icon className={`w-4 h-4 ${styles.icon}`} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <button
                    onClick={handleClick}
                    className="w-full text-left"
                >
                    <div className={`text-xs font-semibold leading-snug truncate ${
                        notification.is_read
                            ? 'text-gray-600 dark:text-gray-400'
                            : 'text-gray-900 dark:text-white'
                    }`}>
                        {notification.title}
                    </div>
                    {notification.body && (
                        <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed line-clamp-2">
                            {notification.body}
                        </div>
                    )}
                    <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] text-gray-400">{notification.created_at}</span>
                        {notification.sender_name && (
                            <>
                                <span className="text-[10px] text-gray-300 dark:text-gray-600">·</span>
                                <span className="text-[10px] text-gray-400">{notification.sender_name}</span>
                            </>
                        )}
                        {notification.action_url && notification.action_label && (
                            <>
                                <span className="text-[10px] text-gray-300 dark:text-gray-600">·</span>
                                <span className="text-[10px] text-[#5B5FC7] dark:text-[#8A8DE2] flex items-center gap-0.5">
                                    {notification.action_label}
                                    <ExternalLink className="w-2.5 h-2.5" />
                                </span>
                            </>
                        )}
                    </div>
                </button>
            </div>

            {/* Dismiss */}
            <button
                onClick={() => onDismiss(notification.id)}
                className="flex-shrink-0 opacity-0 group-hover:opacity-100 p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
                title="Dismiss"
            >
                <X className="w-3 h-3" />
            </button>
        </div>
    );
}

/* ─── Main panel ──────────────────────────────────────────────────────── */

export default function NotificationPanel() {
    const { notifications: shared } = usePage().props;
    const unreadCount = shared?.unread_count ?? 0;

    const [open, setOpen]   = useState(false);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const panelRef = useRef(null);
    const bellRef  = useRef(null);

    // Close on outside click
    useEffect(() => {
        if (!open) return;
        function handler(e) {
            if (
                panelRef.current && !panelRef.current.contains(e.target) &&
                bellRef.current  && !bellRef.current.contains(e.target)
            ) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    // Fetch notifications when panel opens
    useEffect(() => {
        if (!open) return;
        setLoading(true);
        fetch(route('notifications.feed'), {
            headers: { 'X-Requested-With': 'XMLHttpRequest', 'Accept': 'application/json' },
        })
            .then((r) => r.json())
            .then((data) => {
                setItems(data.notifications?.data ?? []);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [open]);

    const handleRead = (id) => {
        router.patch(route('notifications.read', id), {}, { preserveScroll: true });
        setItems((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
    };

    const handleDismiss = (id) => {
        router.delete(route('notifications.destroy', id), { preserveScroll: true });
        setItems((prev) => prev.filter((n) => n.id !== id));
    };

    const handleReadAll = () => {
        router.patch(route('notifications.read-all'), {}, { preserveScroll: true });
        setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
    };

    const hasUnread = items.some((n) => !n.is_read);

    return (
        <>
            {/* Bell button */}
            <button
                ref={bellRef}
                onClick={() => setOpen((o) => !o)}
                className={`relative p-2 rounded-lg transition ${
                    open
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200'
                        : 'text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                title="Notifications"
            >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-[#5B5FC7] text-white text-[9px] font-bold flex items-center justify-center leading-none">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Slide-in panel */}
            {open && (
                <div
                    ref={panelRef}
                    className="absolute right-0 top-full mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-[#15151A] border border-[#E8E8EC] dark:border-[#26262D] rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col"
                    style={{ maxHeight: 'min(560px, calc(100vh - 100px))' }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-[#E8E8EC] dark:border-[#26262D] flex-shrink-0">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-900 dark:text-white">Notifications</span>
                            {unreadCount > 0 && (
                                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[#5B5FC7]/10 text-[#5B5FC7] dark:bg-[#5B5FC7]/20 dark:text-[#8A8DE2]">
                                    {unreadCount} unread
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-1">
                            {hasUnread && (
                                <button
                                    onClick={handleReadAll}
                                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                                    title="Mark all as read"
                                >
                                    <CheckCheck className="w-3.5 h-3.5" />
                                    Mark all read
                                </button>
                            )}
                            <button
                                onClick={() => setOpen(false)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* List */}
                    <div className="overflow-y-auto flex-1 divide-y divide-[#F0F0F4] dark:divide-[#26262D]">
                        {loading ? (
                            <div className="py-12 text-center text-xs text-gray-400">
                                Loading…
                            </div>
                        ) : items.length === 0 ? (
                            <div className="py-14 text-center">
                                <Bell className="w-8 h-8 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
                                <p className="text-xs text-gray-400">No notifications yet</p>
                            </div>
                        ) : (
                            items.map((n) => (
                                <NotificationRow
                                    key={n.id}
                                    notification={n}
                                    onRead={handleRead}
                                    onDismiss={handleDismiss}
                                />
                            ))
                        )}
                    </div>

                    {/* Footer / View All */}
                    <div className="p-2.5 border-t border-[#E8E8EC] dark:border-[#26262D] bg-gray-50/70 dark:bg-[#1A1A22] text-center flex-shrink-0">
                        <Link
                            href={route('notifications.index')}
                            onClick={() => setOpen(false)}
                            className="text-xs font-semibold text-[#5B5FC7] dark:text-[#8A8DE2] hover:text-[#4A4EB5] dark:hover:text-[#9B9EE8] inline-flex items-center gap-1.5 transition"
                        >
                            View all notifications
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>
            )}
        </>
    );
}
