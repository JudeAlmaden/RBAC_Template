import React, { useState, useEffect, useRef } from 'react';
import { Link, usePage } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import Avatar from '@/Components/Avatar';
import { ToastProvider, useToast } from '@/Components/Toast';
import NotificationPanel from '@/Components/NotificationPanel';
import RolePreviewBanner from '@/Components/RolePreviewBanner';
import RoleSwitcher from '@/Components/RoleSwitcher';
import { useTheme } from '@/hooks/useTheme';
import {
    LayoutDashboard,
    Users,
    ShieldCheck,
    Bell,
    LogOut,
    Menu,
    X,
    SlidersHorizontal,
    Sun,
    Moon,
    MoreHorizontal,
    History,
    Palette,
} from 'lucide-react';

/* ─── User menu popover ───────────────────────────────────────────────── */

function UserMenu({ user, formatRole, roleContext }) {
    const [open, setOpen] = useState(false);
    const [showPresets, setShowPresets] = useState(false);
    const ref = useRef(null);
    const { dark, toggleDark, theme, setTheme, presets } = useTheme();

    // Close on outside click
    useEffect(() => {
        function handleClick(e) {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
                setShowPresets(false);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const roleLabel = roleContext?.activeRole
        ? formatRole(roleContext.activeRole)
        : (user.roles && user.roles.length > 1
            ? user.roles.map(formatRole).join(', ')
            : formatRole(user.role));

    return (
        <div className="px-3 pb-3 pt-1.5 relative" ref={ref}>
            <div className="p-3 rounded-xl bg-canvas-surface border border-line">
                {/* User identity row */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <Avatar name={user.name} size="w-7 h-7" />
                        <div className="min-w-0">
                            <div className="text-xs font-semibold text-body-main truncate">
                                {user.name}
                            </div>
                            <div className="text-[10px] text-body-muted truncate" title={roleLabel}>
                                {roleLabel}
                            </div>
                        </div>
                    </div>

                    {/* ⋯ toggle */}
                    <button
                        onClick={() => setOpen((o) => !o)}
                        className={`p-1.5 rounded-lg transition flex-shrink-0 ${
                            open
                                ? 'bg-canvas-hover text-body-main'
                                : 'text-body-muted hover:text-body-main hover:bg-canvas-hover'
                        }`}
                        title="Account menu"
                    >
                        <MoreHorizontal className="w-4 h-4" />
                    </button>
                </div>

                {/* Popover panel — slides up above the card */}
                {open && (
                    <div className="absolute left-3 right-3 bottom-[calc(100%-8px)] mb-2 bg-canvas-raised border border-line rounded-xl shadow-xl overflow-hidden z-50 animate-in">
                        {/* Dark mode toggle */}
                        <button
                            onClick={() => { toggleDark(); }}
                            className="w-full flex items-center justify-between px-4 py-2.5 text-xs text-body-main hover:bg-canvas-hover transition text-left"
                        >
                            <span className="flex items-center gap-3">
                                {dark
                                    ? <Sun className="w-3.5 h-3.5 text-brand" />
                                    : <Moon className="w-3.5 h-3.5 text-body-muted" />
                                }
                                <span>{dark ? 'Light mode' : 'Dark mode'}</span>
                            </span>
                            <span className="text-[10px] uppercase font-mono tracking-wider text-body-muted">
                                {dark ? 'Dark' : 'Light'}
                            </span>
                        </button>

                        {/* Theme preset selector */}
                        <div className="border-t border-line" />
                        <div className="px-4 py-2">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[11px] font-semibold text-body-muted flex items-center gap-2">
                                    <Palette className="w-3 h-3 text-brand" />
                                    Theme Preset
                                </span>
                                <span className="text-[10px] capitalize text-brand font-medium">
                                    {theme}
                                </span>
                            </div>
                            <div className="grid grid-cols-4 gap-1.5 pt-1">
                                {presets.map((p) => {
                                    const isSelected = theme === p.id;
                                    return (
                                        <button
                                            key={p.id}
                                            onClick={() => setTheme(p.id)}
                                            title={p.label}
                                            className={`flex flex-col items-center gap-1 p-1.5 rounded-lg border text-[10px] transition ${
                                                isSelected
                                                    ? 'border-brand bg-brand/10 text-brand font-semibold shadow-xs'
                                                    : 'border-line hover:border-brand/40 text-body-muted hover:text-body-main'
                                            }`}
                                        >
                                            <span
                                                className="w-3.5 h-3.5 rounded-full ring-1 ring-black/10"
                                                style={{ backgroundColor: p.primaryColor }}
                                            />
                                            <span className="truncate max-w-full capitalize">{p.id}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="border-t border-line" />

                        {/* Profile Settings */}
                        <Link
                            href={route('profile.edit')}
                            onClick={() => setOpen(false)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-body-main hover:bg-canvas-hover transition"
                        >
                            <SlidersHorizontal className="w-3.5 h-3.5 text-body-muted" />
                            Profile Settings
                        </Link>

                        <div className="border-t border-line" />

                        {/* Logout */}
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            onClick={() => setOpen(false)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            Log out
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ─── Inner layout (needs toast context) ─────────────────────────────── */

function LayoutInner({ header, children }) {
    const { auth, flash, roleContext = {}, notifications: sharedNotifications } = usePage().props;
    const user = auth.user;
    const can  = auth.can || {};
    const unreadNotificationsCount = sharedNotifications?.unread_count ?? 0;
    const { toast } = useToast();
    const { activeRole, switchableRoles = [], isPreviewing = false } = roleContext;

    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Show flash messages as toasts
    useEffect(() => {
        if (flash?.success) toast(flash.success, 'success');
        if (flash?.error)   toast(flash.error,   'error');
        if (flash?.warning) toast(flash.warning,  'warning');
    }, [flash?.success, flash?.error, flash?.warning]);

    const formatRole = (role) => {
        if (!role) return 'User';
        if (role === 'super_admin') return 'Super Admin';
        if (role === 'admin') return 'Admin';
        if (role === 'user') return 'User';
        return role.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    };

    const navItems = [
        {
            name: 'Dashboard',
            href: route('dashboard'),
            active: route().current('dashboard'),
            icon: LayoutDashboard,
            show: true,
        },
        {
            name: 'Notifications',
            href: route('notifications.index'),
            active: route().current('notifications.*'),
            icon: Bell,
            show: true,
            badge: unreadNotificationsCount > 0 ? (unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount) : null,
        },
        {
            name: 'Accounts',
            href: route('users.index'),
            active: route().current('users.*'),
            icon: Users,
            show: Boolean(can.manageUsers),
        },
        {
            name: 'Roles & Permissions',
            href: route('roles.index'),
            active: route().current('roles.*'),
            icon: ShieldCheck,
            show: Boolean(can.manageRoles),
        },
        {
            name: 'Audit Logs',
            href: route('activity-logs.index'),
            active: route().current('activity-logs.*'),
            icon: History,
            show: Boolean(can.viewLogs),
        },
    ];

    return (
        <div className="min-h-screen bg-canvas-page text-body-main font-sans antialiased flex">
            {/* MOBILE SIDEBAR BACKDROP */}
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm transition-opacity"
                />
            )}

            {/* SIDEBAR */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-canvas-card border-r border-line flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
                    sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
                }`}
            >
                <div>
                    {/* Brand Header */}
                    <div className="h-16 px-6 flex items-center justify-between border-b border-line">
                        <Link href={route('dashboard')} className="flex items-center gap-3">
                            <ApplicationLogo className="w-8 h-8" />
                            <span className="font-bold text-base tracking-tight text-body-main">
                                Template
                            </span>
                        </Link>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden p-1.5 rounded-lg text-body-muted hover:text-body-main"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Navigation Links */}
                    <div className="px-3 py-6 space-y-1">
                        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-body-subtle font-mono">
                            Navigation
                        </div>
                        {navItems.filter(item => item.show).map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                                        item.active
                                            ? 'bg-brand/10 text-brand font-semibold'
                                            : 'text-body-muted hover:bg-canvas-hover hover:text-body-main'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon className={`w-4 h-4 ${item.active ? 'text-brand' : 'text-body-subtle'}`} />
                                        <span>{item.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {item.badge && (
                                            <span className="min-w-[18px] h-4 px-1.5 rounded-full bg-brand text-white text-[10px] font-bold flex items-center justify-center leading-none">
                                                {item.badge}
                                            </span>
                                        )}
                                        {item.active && (
                                            <div className="w-1.5 h-1.5 rounded-full bg-brand" />
                                        )}
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Bottom Section: Role View Switcher & User Menu */}
                <div className="border-t border-line">
                    <RoleSwitcher
                        activeRole={activeRole}
                        switchableRoles={switchableRoles}
                        isPreviewing={isPreviewing}
                        userRoles={user?.roles || []}
                        isSuperAdmin={Boolean(can?.isSuperAdmin || user?.roles?.includes('super_admin'))}
                    />
                    <UserMenu user={user} formatRole={formatRole} roleContext={roleContext} />
                </div>
            </aside>

            {/* MAIN CONTENT WRAPPER */}
            <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
                {/* Role Preview Banner */}
                {isPreviewing && (
                    <RolePreviewBanner activeRole={activeRole} />
                )}

                {/* Top Bar */}
                <header className="h-16 bg-canvas-card border-b border-line sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 rounded-lg text-body-muted hover:bg-canvas-hover"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <div>{header}</div>
                    </div>
                    {/* Bell */}
                    <div className="relative">
                        <NotificationPanel />
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}

/* ─── Public export wraps with ToastProvider ──────────────────────────── */

export default function AuthenticatedLayout({ header, children }) {
    return (
        <ToastProvider>
            <LayoutInner header={header}>{children}</LayoutInner>
        </ToastProvider>
    );
}
