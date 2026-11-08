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
        icon:   'text-brand',
        dot:    'bg-brand',
        ring:   'bg-brand/10',
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
                ? 'bg-brand/5'
                : ''
        } hover:bg-canvas-hover`}>

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
                            ? 'text-body-muted'
                            : 'text-body-main'
                    }`}>
                        {notification.title}
                    </div>
                    {notification.body && (
                        <div className="text-[11px] text-body-muted mt-0.5 leading-relaxed line-clamp-2">
                            {notification.body}
                        </div>
                    )}
                    <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] text-body-subtle">{notification.created_at}</span>
                        {notification.sender_name && (
                            <>
                                <span className="text-[10px] text-body-subtle">·</span>
                                <span className="text-[10px] text-body-subtle">{notification.sender_name}</span>
                            </>
                        )}
                        {notification.action_url && notification.action_label && (
                            <>
                                <span className="text-[10px] text-body-subtle">·</span>
                                <span className="text-[10px] text-brand flex items-center gap-0.5">
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
                    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-brand text-white text-[9px] font-bold flex items-center justify-center leading-none">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Slide-in panel */}
            {open && (
                <div
                    ref={panelRef}
                    className="absolute right-0 top-full mt-2 w-96 max-w-[calc(100vw-2rem)] bg-canvas-card border border-line rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col"
                    style={{ maxHeight: 'min(560px, calc(100vh - 100px))' }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-line flex-shrink-0">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-body-main">Notifications</span>
                            {unreadCount > 0 && (
                                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-brand/10 text-brand">
                                    {unreadCount} unread
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-1">
                            {hasUnread && (
                                <button
                                    onClick={handleReadAll}
                                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium text-body-muted hover:text-body-main hover:bg-canvas-hover rounded-lg transition"
                                    title="Mark all as read"
                                >
                                    <CheckCheck className="w-3.5 h-3.5" />
                                    Mark all read
                                </button>
                            )}
                            <button
                                onClick={() => setOpen(false)}
                                className="p-1.5 rounded-lg text-body-muted hover:text-body-main hover:bg-canvas-hover transition"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* List */}
                    <div className="overflow-y-auto flex-1 divide-y divide-line">
                        {loading ? (
                            <div className="py-12 text-center text-xs text-body-subtle">
                                Loading…
                            </div>
                        ) : items.length === 0 ? (
                            <div className="py-14 text-center">
                                <Bell className="w-8 h-8 text-body-subtle mx-auto mb-3" />
                                <p className="text-xs text-body-subtle">No notifications yet</p>
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
                    <div className="p-2.5 border-t border-line bg-canvas-surface text-center flex-shrink-0">
                        <Link
                            href={route('notifications.index')}
                            onClick={() => setOpen(false)}
                            className="text-xs font-semibold text-brand hover:text-brand-hover inline-flex items-center gap-1.5 transition"
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
