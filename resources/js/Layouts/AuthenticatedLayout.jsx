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
    Crosshair,
    BookOpen,
    Award,
    Settings,
    HelpCircle,
    MessageSquareWarning,
    Sparkles,
    GraduationCap,
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
            root.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            root.classList.remove('dark');
            root.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        }
    }, [dark]);

    return [dark, setDark];
}

/* ─── User menu popover ───────────────────────────────────────────────── */

function UserMenu({ user, dark, setDark, formatRole, roleContext }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

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
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                {/* User identity row */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <Avatar name={user.name} size="w-7 h-7" />
                        <div className="min-w-0">
                            <div className="text-xs font-semibold text-white truncate">
                                {user.name}
                            </div>
                            <div className="text-[10px] text-[#8BADC7] truncate" title={roleLabel}>
                                {roleLabel}
                            </div>
                        </div>
                    </div>

                    {/* ⋯ toggle */}
                    <button
                        onClick={() => setOpen((o) => !o)}
                        className={`p-1.5 rounded-lg transition flex-shrink-0 ${
                            open
                                ? 'bg-white/15 text-white'
                                : 'text-[#8BADC7] hover:text-white hover:bg-white/10'
                        }`}
                        title="Account menu"
                    >
                        <MoreHorizontal className="w-4 h-4" />
                    </button>
                </div>

                {/* Popover panel — slides up above the card */}
                {open && (
                    <div className="absolute left-3 right-3 bottom-[calc(100%-8px)] mb-2 bg-[#1D2B3B] border border-[#2B3A4B] rounded-xl shadow-2xl overflow-hidden z-50">
                        {/* Dark mode toggle */}
                        <button
                            onClick={() => { setDark(!dark); setOpen(false); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-[#A7B5C5] hover:bg-white/5 hover:text-white transition text-left"
                        >
                            {dark
                                ? <Sun className="w-3.5 h-3.5 text-[#65A9E3]" />
                                : <Moon className="w-3.5 h-3.5 text-[#65A9E3]" />
                            }
                            {dark ? 'Light mode' : 'Dark mode'}
                        </button>

                        {/* Profile Settings */}
                        <Link
                            href={route('profile.edit')}
                            onClick={() => setOpen(false)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-[#A7B5C5] hover:bg-white/5 hover:text-white transition"
                        >
                            <SlidersHorizontal className="w-3.5 h-3.5 text-[#65A9E3]" />
                            Profile Settings
                        </Link>

                        <div className="border-t border-white/10 my-0.5" />

                        {/* Logout */}
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            onClick={() => setOpen(false)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300 transition"
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

/* ─── Sidebar nav link ────────────────────────────────────────────────── */

function NavItem({ item, onNavigate }) {
    const Icon = item.icon;
    return (
        <Link
            href={item.href}
            onClick={onNavigate}
            className={`group flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                item.active
                    ? 'bg-[#4A91CC]/20 text-white font-semibold'
                    : 'text-[#8BADC7] hover:bg-white/5 hover:text-white font-medium'
            }`}
        >
            <div className="flex items-center gap-3">
                <Icon
                    className={`w-4 h-4 shrink-0 ${
                        item.active ? 'text-[#65A9E3]' : 'text-[#6B8FA8] group-hover:text-[#8BADC7]'
                    }`}
                />
                <span className="truncate">{item.name}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
                {item.badge && (
                    <span className="min-w-[18px] h-4 px-1.5 rounded-full bg-[#4A91CC] text-white text-[10px] font-bold flex items-center justify-center leading-none">
                        {item.badge}
                    </span>
                )}
                {item.active && (
                    <div className="w-1.5 h-1.5 rounded-full bg-[#65A9E3]" />
                )}
            </div>
        </Link>
    );
}

/* ─── Sidebar nav group ───────────────────────────────────────────────── */

function NavGroup({ label, items, onNavigate }) {
    const visible = items.filter((i) => i.show);
    if (visible.length === 0) return null;
    return (
        <div className="space-y-0.5">
            <div className="px-3 pt-4 pb-1 text-[10px] font-bold uppercase tracking-widest text-[#4F6D82]">
                {label}
            </div>
            {visible.map((item) => (
                <NavItem key={item.name} item={item} onNavigate={onNavigate} />
            ))}
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
        if (!role) return 'Learner';
        if (role === 'super_admin') return 'Super Admin';
        if (role === 'admin') return 'Admin';
        if (role === 'learner') return 'Learner';
        if (role === 'user') return 'Learner';
        return role.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    };

    const learnerNav = [
        {
            name: 'Dashboard',
            href: route('dashboard'),
            active: route().current('dashboard'),
            icon: LayoutDashboard,
            show: true,
        },
        {
            name: 'Cyber Range',
            href: route('learner.cyber-range'),
            active: route().current('learner.cyber-range'),
            icon: Crosshair,
            show: true,
        },
        {
            name: 'TALA',
            href: route('learner.tala'),
            active: route().current('learner.tala'),
            icon: Sparkles,
            show: true,
        },
        {
            name: 'Glossary',
            href: route('learner.glossary'),
            active: route().current('learner.glossary'),
            icon: BookOpen,
            show: true,
        },
    ];

    const otherNav = [
        {
            name: 'Notifications',
            href: route('notifications.index'),
            active: route().current('notifications.*'),
            icon: Bell,
            show: true,
            badge: unreadNotificationsCount > 0 ? (unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount) : null,
        },
        {
            name: 'My Credentials',
            href: route('learner.credentials'),
            active: route().current('learner.credentials'),
            icon: Award,
            show: true,
        },
        {
            name: 'Settings',
            href: route('profile.edit'),
            active: route().current('profile.edit'),
            icon: Settings,
            show: true,
        },
        {
            name: 'FAQ',
            href: route('learner.faq'),
            active: route().current('learner.faq'),
            icon: HelpCircle,
            show: true,
        },
        {
            name: 'Report a Problem',
            href: route('learner.report'),
            active: route().current('learner.report'),
            icon: MessageSquareWarning,
            show: true,
        },
    ];

    const adminNav = [
        {
            name: 'Accounts',
            href: route('users.index'),
            active: route().current('users.*'),
            icon: Users,
            show: Boolean(can.manageUsers),
        },
        {
            name: 'Courses',
            href: route('courses.index'),
            active: route().current('courses.*'),
            icon: GraduationCap,
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

    const hasAdminNav = adminNav.some((i) => i.show);

    return (
        <div className="min-h-screen bg-[#F4F7FB] dark:bg-[#0F1722] text-[#1F2937] dark:text-[#E8EEF5] font-sans antialiased flex">
            {/* MOBILE SIDEBAR BACKDROP */}
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                />
            )}

            {/* SIDEBAR */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#102746] dark:bg-[#0C1B2D] flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
                    sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
                }`}
            >
                <div className="flex flex-col min-h-0 flex-1">
                    {/* Brand Header */}
                    <div className="h-16 px-5 flex items-center justify-between border-b border-white/10 shrink-0">
                        <Link href={route('dashboard')} className="flex items-center gap-3">
                            <ApplicationLogo className="w-8 h-8" />
                            <div className="flex flex-col leading-tight">
                                <span className="text-[11px] font-bold uppercase tracking-widest text-[#8BADC7]">
                                    FusionNode
                                </span>
                                <span className="text-sm font-extrabold tracking-tight text-white leading-none">
                                    ACADEMY
                                </span>
                            </div>
                            <span className="ml-1 px-1.5 py-0.5 rounded text-[9px] font-bold tracking-widest bg-[#4A91CC]/20 text-[#65A9E3] border border-[#4A91CC]/30 uppercase">
                                NEXUS
                            </span>
                        </Link>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden p-1.5 rounded-lg text-[#8BADC7] hover:text-white hover:bg-white/10"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Navigation Links — scrollable */}
                    <div className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
                        <NavGroup label="Learner" items={learnerNav} onNavigate={() => setSidebarOpen(false)} />
                        {hasAdminNav && (
                            <NavGroup label="Administration" items={adminNav} onNavigate={() => setSidebarOpen(false)} />
                        )}
                        <NavGroup label="Others" items={otherNav} onNavigate={() => setSidebarOpen(false)} />
                    </div>
                </div>

                {/* Bottom: Role Switcher + User Menu + Footer */}
                <div className="shrink-0 border-t border-white/10">
                    <RoleSwitcher
                        activeRole={activeRole}
                        switchableRoles={switchableRoles}
                        isPreviewing={isPreviewing}
                        userRoles={user?.roles || []}
                        isSuperAdmin={Boolean(can?.isSuperAdmin || user?.roles?.includes('super_admin'))}
                    />
                    <UserMenu user={user} dark={dark} setDark={setDark} formatRole={formatRole} roleContext={roleContext} />

                    {/* Footer links */}
                    <div className="px-5 py-3 flex items-center justify-between border-t border-white/10">
                        <div className="flex items-center gap-3 text-[10px] text-[#4F6D82]">
                            <span className="hover:text-[#8BADC7] cursor-pointer transition">About</span>
                            <span className="hover:text-[#8BADC7] cursor-pointer transition">Terms</span>
                            <span className="hover:text-[#8BADC7] cursor-pointer transition">Privacy</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-[#4F6D82]">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                            <span>Online</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT WRAPPER */}
            <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
                {/* Role Preview Banner */}
                {isPreviewing && (
                    <RolePreviewBanner activeRole={activeRole} />
                )}

                {/* Top Bar */}
                <header className="h-14 bg-white dark:bg-[#172331] border-b border-[#E2E8F0] dark:border-[#2B3A4B] sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-[#1D2B3B]"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <div>{header}</div>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Theme toggle */}
                        <button
                            onClick={() => setDark(!dark)}
                            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1D2B3B] transition"
                            title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
                        >
                            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        </button>
                        {/* Notification Bell */}
                        <div className="relative">
                            <NotificationPanel />
                        </div>
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
