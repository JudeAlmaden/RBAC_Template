import React, { useState, useEffect, useRef } from 'react';
import { Link, usePage } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import Avatar from '@/Components/Avatar';
import { ToastProvider, useToast } from '@/Components/Toast';
import NotificationPanel from '@/Components/NotificationPanel';
import RolePreviewBanner from '@/Components/RolePreviewBanner';
import RoleSwitcher from '@/Components/RoleSwitcher';
import useTheme from '@/theme';
import {
    LayoutDashboard,
    Users,
    ShieldCheck,
    LogOut,
    Menu,
    X,
    SlidersHorizontal,
    Sun,
    Moon,
    AlertTriangle,
    MoreHorizontal,
    History,
    PanelLeftClose,
    PanelLeftOpen,
    Crosshair,
    BookOpen,
    Award,
    Settings,
    HelpCircle,
    MessageSquareWarning,
    Sparkles,
    GraduationCap,
} from 'lucide-react';

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
                            <div className="text-[0.625rem] text-sidebar-ink truncate" title={roleLabel}>
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
                                : 'text-sidebar-ink hover:text-white hover:bg-white/10'
                        }`}
                        title="Account menu"
                    >
                        <MoreHorizontal className="w-4 h-4" />
                    </button>
                </div>

                {/* Popover panel — slides up above the card */}
                {open && (
                    <div className="absolute left-3 right-3 bottom-[calc(100%-8px)] mb-2 bg-raised border border-line-strong rounded-xl shadow-2xl overflow-hidden z-50">
                        {/* Dark mode toggle */}
                        <button
                            onClick={() => { setDark(!dark); setOpen(false); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-muted hover:bg-white/5 hover:text-white transition text-left"
                        >
                            {dark
                                ? <Sun className="w-3.5 h-3.5 text-accent-light" />
                                : <Moon className="w-3.5 h-3.5 text-accent-light" />
                            }
                            {dark ? 'Light mode' : 'Dark mode'}
                        </button>

                        {/* Profile Settings */}
                        <Link
                            href={route('profile.edit')}
                            onClick={() => setOpen(false)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-muted hover:bg-white/5 hover:text-white transition"
                        >
                            <SlidersHorizontal className="w-3.5 h-3.5 text-accent-light" />
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
                    ? 'bg-accent/20 text-white font-semibold'
                    : 'text-sidebar-ink hover:bg-white/5 hover:text-white font-medium'
            }`}
        >
            <div className="flex items-center gap-3">
                <Icon
                    className={`w-4 h-4 shrink-0 ${
                        item.active ? 'text-accent-light' : 'text-sidebar-faint group-hover:text-sidebar-ink'
                    }`}
                />
                <span className="truncate">{item.name}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
                {item.badge && (
                    <span className="min-w-[18px] h-4 px-1.5 rounded-full bg-accent text-white text-[0.625rem] font-bold flex items-center justify-center leading-none">
                        {item.badge}
                    </span>
                )}
                {item.active && (
                    <div className="w-1.5 h-1.5 rounded-full bg-accent-light" />
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
        <div className={label ? 'space-y-0.5' : 'space-y-0.5 pt-3'}>
            {label && (
                <div className="px-3 pt-4 pb-1 text-[0.625rem] font-bold uppercase tracking-widest text-sidebar-faint">
                    {label}
                </div>
            )}
            {visible.map((item) => (
                <NavItem key={item.name} item={item} onNavigate={onNavigate} />
            ))}
        </div>
    );
}

/* ─── Inner layout (needs toast context) ─────────────────────────────── */

function LayoutInner({ header, children, startCollapsed = false }) {
    const { auth, flash, roleContext = {} } = usePage().props;
    const user = auth.user;
    const can  = auth.can || {};
    const { toast } = useToast();
    const { activeRole, switchableRoles = [], isPreviewing = false } = roleContext;

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(() => {
        if (startCollapsed) return true;
        if (typeof window === 'undefined') return false;
        return localStorage.getItem('sidebar-collapsed') === 'true';
    });
    const [dark, setDark] = useTheme();

    // Remember the collapsed sidebar state across page visits and reloads.
    useEffect(() => {
        localStorage.setItem('sidebar-collapsed', collapsed ? 'true' : 'false');
    }, [collapsed]);

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

    const mainNav = [
        {
            name: 'Dashboard',
            href: route('dashboard'),
            active: route().current('dashboard'),
            icon: LayoutDashboard,
            show: true,
        },
    ];

    const learnNav = [
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

    const accountNav = [
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
            show: Boolean(can.manageUsers || can.isSuperAdmin),
        },
        {
            name: 'Courses',
            href: route('courses.index'),
            active: route().current('courses.*'),
            icon: GraduationCap,
            show: Boolean(can.manageCourses || can.isSuperAdmin),
        },
        {
            name: 'Roles & Permissions',
            href: route('roles.index'),
            active: route().current('roles.*'),
            icon: ShieldCheck,
            show: Boolean(can.manageRoles || can.isSuperAdmin),
        },
        {
            name: 'Audit Logs',
            href: route('activity-logs.index'),
            active: route().current('activity-logs.*'),
            icon: History,
            show: Boolean(can.viewLogs || can.isSuperAdmin),
        },
    ];

    const hasAdminNav = adminNav.some((i) => i.show);

    return (
        <div className="min-h-screen bg-page text-ink font-sans antialiased flex">
            {/* MOBILE SIDEBAR BACKDROP */}
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                />
            )}

            {/* SIDEBAR */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar flex flex-col justify-between transition-transform duration-300 ${
                    sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
                } ${collapsed ? 'lg:-translate-x-full' : 'lg:translate-x-0'}`}
            >
                <div className="flex flex-col min-h-0 flex-1">
                    {/* Brand Header */}
                    <div className="h-16 px-5 flex items-center justify-between border-b border-white/10 shrink-0">
                        <Link href={route('dashboard')} className="flex items-center gap-3">
                            <ApplicationLogo className="w-8 h-8" />
                            <div className="flex flex-col leading-tight">
                                <span className="text-[0.6875rem] font-bold uppercase tracking-widest text-sidebar-ink">
                                    FusionNode
                                </span>
                                <span className="text-sm font-extrabold tracking-tight text-white leading-none">
                                    ACADEMY
                                </span>
                            </div>
                            <span className="ml-1 px-1.5 py-0.5 rounded text-[0.5625rem] font-bold tracking-widest bg-accent/20 text-accent-light border border-accent/30 uppercase">
                                NEXUS
                            </span>
                        </Link>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden p-1.5 rounded-lg text-sidebar-ink hover:text-white hover:bg-white/10"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Navigation Links — scrollable */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar overscroll-contain px-3 py-3 space-y-0.5">
                        <NavGroup items={mainNav} onNavigate={() => setSidebarOpen(false)} />
                        <NavGroup label="Learn" items={learnNav} onNavigate={() => setSidebarOpen(false)} />
                        {hasAdminNav && (
                            <NavGroup label="Manage" items={adminNav} onNavigate={() => setSidebarOpen(false)} />
                        )}
                        <NavGroup label="Account" items={accountNav} onNavigate={() => setSidebarOpen(false)} />
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
                        <div className="flex items-center gap-3 text-[0.625rem] text-sidebar-faint">
                            <span className="hover:text-sidebar-ink cursor-pointer transition">About</span>
                            <span className="hover:text-sidebar-ink cursor-pointer transition">Terms</span>
                            <span className="hover:text-sidebar-ink cursor-pointer transition">Privacy</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[0.625rem] text-sidebar-faint">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                            <span>Online</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT WRAPPER */}
            <div className={`flex-1 flex flex-col min-w-0 transition-[padding] duration-300 ${collapsed ? 'lg:pl-0' : 'lg:pl-64'}`}>
                {/* Role Preview Banner */}
                {isPreviewing && (
                    <RolePreviewBanner activeRole={activeRole} />
                )}

                {/* Top Bar */}
                <header className="h-14 bg-surface border-b border-line-strong sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-raised"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setCollapsed((value) => !value)}
                            className="hidden lg:inline-flex p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-raised transition"
                            title={collapsed ? 'Show sidebar' : 'Hide sidebar'}
                            aria-label={collapsed ? 'Show sidebar' : 'Hide sidebar'}
                            aria-expanded={!collapsed}
                        >
                            {collapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
                        </button>
                        <div>{header}</div>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Theme toggle */}
                        <button
                            onClick={() => setDark(!dark)}
                            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-raised transition"
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

export default function AuthenticatedLayout({ header, children, startCollapsed = false }) {
    return (
        <ToastProvider>
            <LayoutInner header={header} startCollapsed={startCollapsed}>
                {children}
            </LayoutInner>
        </ToastProvider>
    );
}
