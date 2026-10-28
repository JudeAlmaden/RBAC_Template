import React, { useState, useEffect, useRef } from 'react';
import { Link, usePage } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import Avatar from '@/Components/Avatar';
import { ToastProvider, useToast } from '@/Components/Toast';
import NotificationPanel from '@/Components/NotificationPanel';
import RolePreviewBanner from '@/Components/RolePreviewBanner';
import RoleSwitcher from '@/Components/RoleSwitcher';
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
    AlertTriangle,
    MoreHorizontal,
    History,
} from 'lucide-react';

/* ─── Dark mode hook ──────────────────────────────────────────────────── */

function useDarkMode() {
    const [dark, setDark] = useState(() => {
        if (typeof window === 'undefined') return false;
        const stored = localStorage.getItem('theme');
        if (stored) return stored === 'dark';
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    useEffect(() => {
        const root = document.documentElement;
        if (dark) {
            root.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [dark]);

    return [dark, setDark];
}

/* ─── User menu popover ───────────────────────────────────────────────── */

function UserMenu({ user, dark, setDark, formatRole, roleContext }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    // Close on outside click
    useEffect(() => {
        function handleClick(e) {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
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
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#1A1A22] border border-gray-100 dark:border-[#2A2A35]">
                {/* User identity row */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <Avatar name={user.name} size="w-7 h-7" />
                        <div className="min-w-0">
                            <div className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">
                                {user.name}
                            </div>
                            <div className="text-[10px] text-gray-500 dark:text-gray-400 truncate" title={roleLabel}>
                                {roleLabel}
                            </div>
                        </div>
                    </div>

                    {/* ⋯ toggle */}
                    <button
                        onClick={() => setOpen((o) => !o)}
                        className={`p-1.5 rounded-lg transition flex-shrink-0 ${
                            open
                                ? 'bg-gray-200 dark:bg-[#2A2A35] text-gray-800 dark:text-gray-100'
                                : 'text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#2A2A35]'
                        }`}
                        title="Account menu"
                    >
                        <MoreHorizontal className="w-4 h-4" />
                    </button>
                </div>

                {/* Popover panel — slides up above the card */}
                {open && (
                    <div className="absolute left-3 right-3 bottom-[calc(100%-8px)] mb-2 bg-white dark:bg-[#1E1E26] border border-[#E8E8EC] dark:border-[#2E2E38] rounded-xl shadow-xl overflow-hidden z-50 animate-in">
                        {/* Dark mode toggle */}
                        <button
                            onClick={() => { setDark(!dark); setOpen(false); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#28282E] transition text-left"
                        >
                            {dark
                                ? <Sun className="w-3.5 h-3.5 text-gray-400" />
                                : <Moon className="w-3.5 h-3.5 text-gray-400" />
                            }
                            {dark ? 'Light mode' : 'Dark mode'}
                        </button>

                        {/* Profile Settings */}
                        <Link
                            href={route('profile.edit')}
                            onClick={() => setOpen(false)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#28282E] transition"
                        >
                            <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400" />
                            Profile Settings
                        </Link>

                        <div className="border-t border-[#E8E8EC] dark:border-[#2E2E38]" />

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
    const [dark, setDark] = useDarkMode();

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
        <div className="min-h-screen bg-[#FBFBFC] dark:bg-[#0D0D12] text-[#111111] dark:text-[#F8F9FD] font-sans antialiased flex">
            {/* MOBILE SIDEBAR BACKDROP */}
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm transition-opacity"
                />
            )}

            {/* SIDEBAR */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-[#15151A] border-r border-[#E8E8EC] dark:border-[#26262D] flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
                    sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
                }`}
            >
                <div>
                    {/* Brand Header */}
                    <div className="h-16 px-6 flex items-center justify-between border-b border-[#E8E8EC] dark:border-[#26262D]">
                        <Link href={route('dashboard')} className="flex items-center gap-3">
                            <ApplicationLogo className="w-8 h-8" />
                            <span className="font-bold text-base tracking-tight text-gray-900 dark:text-white">
                                Template
                            </span>
                        </Link>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Navigation Links */}
                    <div className="px-3 py-6 space-y-1">
                        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400 font-mono">
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
                                            ? 'bg-[#5B5FC7]/10 text-[#5B5FC7] dark:bg-[#5B5FC7]/20 dark:text-[#8A8DE2] font-semibold'
                                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1F1F26] hover:text-gray-900 dark:hover:text-gray-100'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon className={`w-4 h-4 ${item.active ? 'text-[#5B5FC7] dark:text-[#8A8DE2]' : 'text-gray-400'}`} />
                                        <span>{item.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {item.badge && (
                                            <span className="min-w-[18px] h-4 px-1.5 rounded-full bg-[#5B5FC7] text-white text-[10px] font-bold flex items-center justify-center leading-none">
                                                {item.badge}
                                            </span>
                                        )}
                                        {item.active && (
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#5B5FC7] dark:bg-[#8A8DE2]" />
                                        )}
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Bottom Section: Role View Switcher & User Menu */}
                <div className="border-t border-[#E8E8EC] dark:border-[#26262D]">
                    <RoleSwitcher
                        activeRole={activeRole}
                        switchableRoles={switchableRoles}
                        isPreviewing={isPreviewing}
                        userRoles={user?.roles || []}
                        isSuperAdmin={Boolean(can?.isSuperAdmin || user?.roles?.includes('super_admin'))}
                    />
                    <UserMenu user={user} dark={dark} setDark={setDark} formatRole={formatRole} roleContext={roleContext} />
                </div>
            </aside>

            {/* MAIN CONTENT WRAPPER */}
            <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
                {/* Role Preview Banner */}
                {isPreviewing && (
                    <RolePreviewBanner activeRole={activeRole} />
                )}

                {/* Top Bar */}
                <header className="h-16 bg-white dark:bg-[#15151A] border-b border-[#E8E8EC] dark:border-[#26262D] sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
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

                {/* Force-password-change banner */}
                {user.must_change_password && route().current('profile.edit') && (
                    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4">
                        <div className="p-3.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 flex items-center gap-2.5 text-xs font-medium shadow-sm">
                            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                            <span>Please update your password before you can access the system.</span>
                        </div>
                    </div>
                )}

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
