import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import {
    ArrowRight,
    Shield,
    Users,
    FileText,
    Bell,
    Terminal,
    Copy,
    Check,
    Lock,
    ExternalLink,
    Layers,
    Sliders,
    Moon,
} from 'lucide-react';

export default function Welcome({ auth, laravelVersion, phpVersion }) {
    const [copiedKey, setCopiedKey] = useState(null);

    const handleCopy = (text, key) => {
        navigator.clipboard.writeText(text);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 2000);
    };

    const modules = [
        {
            icon: Shield,
            title: 'RBAC & PBAC',
            desc: 'Role & permission architecture via Spatie with gate overrides and custom policy guards.',
        },
        {
            icon: Users,
            title: 'User Management',
            desc: 'Account directory with role assignments, status toggling, and capacity enforcement.',
        },
        {
            icon: Sliders,
            title: 'Role View Switcher',
            desc: 'Simulate any assigned role in session for instant UI and permission testing.',
        },
        {
            icon: FileText,
            title: 'Activity History',
            desc: 'Paginated audit logging that retains historical actor and subject names upon deletion.',
        },
        {
            icon: Bell,
            title: 'Notification System',
            desc: 'Multi-severity broadcast and targeted alerts with unread feed and toast alerts.',
        },
        {
            icon: Moon,
            title: 'Theme & Styling',
            desc: 'Responsive Tailwind CSS interface with seamless light and dark mode support.',
        },
    ];

    const seedAccounts = [
        {
            role: 'Super Admin',
            email: 'superadmin@example.com',
            pass: 'password',
            badge: 'Full Access',
            badgeClass: 'bg-purple-500/10 text-purple-700 dark:text-purple-300',
        },
        {
            role: 'Admin',
            email: 'admin@example.com',
            pass: 'password',
            badge: 'User & Role Mgmt',
            badgeClass: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
        },
        {
            role: 'User',
            email: 'user@example.com',
            pass: 'password',
            badge: 'Standard Access',
            badgeClass: 'bg-gray-500/10 text-gray-700 dark:text-gray-300',
        },
    ];

    return (
        <div className="min-h-screen bg-[#FBFBFC] dark:bg-[#0D0E12] text-gray-900 dark:text-gray-100 flex flex-col justify-between selection:bg-[#5B5FC7] selection:text-white font-sans">
            <Head title="Laravel RBAC Starter Kit" />

            {/* Navigation */}
            <header className="h-16 border-b border-gray-200/80 dark:border-white/[0.08] bg-white/70 dark:bg-[#121319]/70 backdrop-blur-md sticky top-0 z-30 transition-colors">
                <div className="max-w-6xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <ApplicationLogo className="w-8 h-8 rounded-lg" />
                        <div>
                            <span className="font-semibold text-sm tracking-tight text-gray-950 dark:text-white">
                                Laravel RBAC Starter
                            </span>
                        </div>
                    </div>

                    <nav className="flex items-center gap-3">
                        {auth?.user ? (
                            <Link
                                href={route('dashboard')}
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#5B5FC7] hover:bg-[#4E52B8] text-white text-xs font-semibold shadow-xs transition"
                            >
                                <span>Go to Dashboard</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        ) : (
                            <Link
                                href={route('login')}
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#5B5FC7] hover:bg-[#4E52B8] text-white text-xs font-semibold shadow-xs transition"
                            >
                                <span>Sign In</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        )}
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
                {/* Hero Header */}
                <div className="max-w-3xl space-y-4">
                    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-[11px] font-mono font-medium bg-gray-100 dark:bg-white/[0.06] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/[0.08]">
                        <span>Starter Kit Template</span>
                        <span className="text-gray-400">·</span>
                        <span>Laravel {laravelVersion || '12'} · Inertia React</span>
                    </div>

                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-950 dark:text-white leading-tight">
                        Role-Based Access Control <br />
                        Application Template
                    </h1>

                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl">
                        A clean, unopinionated starter kit for Laravel & Inertia.js with pre-configured authentication, 
                        hierarchical roles and permissions, audit history, and administrative tooling.
                    </p>

                    <div className="pt-2 flex flex-wrap items-center gap-3">
                        {auth?.user ? (
                            <Link
                                href={route('dashboard')}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#5B5FC7] hover:bg-[#4E52B8] text-white text-xs font-semibold shadow-xs transition"
                            >
                                <span>Open Application</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        ) : (
                            <Link
                                href={route('login')}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#5B5FC7] hover:bg-[#4E52B8] text-white text-xs font-semibold shadow-xs transition"
                            >
                                <span>Sign In</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        )}

                        <a
                            href="#quickstart"
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 dark:border-white/[0.1] bg-white dark:bg-[#161720] text-gray-700 dark:text-gray-300 hover:text-gray-950 dark:hover:text-white text-xs font-medium transition"
                        >
                            <span>Quick Start Guide</span>
                        </a>
                    </div>
                </div>

                {/* Pre-configured Modules Grid */}
                <div className="space-y-4">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Included Modules
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                        {modules.map((m, i) => {
                            const Icon = m.icon;
                            return (
                                <div
                                    key={i}
                                    className="p-4 rounded-xl border border-gray-200/80 dark:border-white/[0.08] bg-white dark:bg-[#14151C] shadow-2xs space-y-2"
                                >
                                    <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-white/[0.06] text-gray-700 dark:text-gray-300 flex items-center justify-center">
                                        <Icon className="w-4 h-4" />
                                    </div>
                                    <h3 className="font-semibold text-xs text-gray-950 dark:text-white">
                                        {m.title}
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                        {m.desc}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Seed Accounts & Quickstart Section */}
                <div id="quickstart" className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-gray-200/80 dark:border-white/[0.08]">
                    {/* Default Seeded Accounts */}
                    <div className="space-y-3">
                        <div className="space-y-1">
                            <h2 className="text-sm font-semibold text-gray-950 dark:text-white">
                                Seeded Test Credentials
                            </h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Populated automatically via <code className="font-mono text-gray-700 dark:text-gray-300">DatabaseSeeder</code>. Password is <code className="font-mono font-medium text-gray-900 dark:text-white">password</code> for all accounts.
                            </p>
                        </div>

                        <div className="space-y-2">
                            {seedAccounts.map((acc) => (
                                <div
                                    key={acc.email}
                                    className="p-3 rounded-lg border border-gray-200/80 dark:border-white/[0.08] bg-white dark:bg-[#14151C] flex items-center justify-between text-xs"
                                >
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                {acc.role}
                                            </span>
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${acc.badgeClass}`}>
                                                {acc.badge}
                                            </span>
                                        </div>
                                        <div className="font-mono text-[11px] text-gray-500 dark:text-gray-400">
                                            {acc.email}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleCopy(acc.email, acc.email)}
                                        title="Copy email"
                                        className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-white/[0.06] text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition"
                                    >
                                        {copiedKey === acc.email ? (
                                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                                        ) : (
                                            <Copy className="w-3.5 h-3.5" />
                                        )}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quickstart Setup Commands */}
                    <div className="space-y-3">
                        <div className="space-y-1">
                            <h2 className="text-sm font-semibold text-gray-950 dark:text-white">
                                Setup & Run Locally
                            </h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Standard installation steps to get your local environment running.
                            </p>
                        </div>

                        <div className="p-4 rounded-xl border border-gray-200/80 dark:border-white/[0.08] bg-gray-900 text-gray-200 font-mono text-xs space-y-3">
                            <div className="flex items-center justify-between text-gray-400 border-b border-gray-800 pb-2 text-[11px]">
                                <span>Terminal setup</span>
                                <button
                                    onClick={() =>
                                        handleCopy(
                                            'composer install\nnpm install\ncp .env.example .env\nphp artisan key:generate\nphp artisan migrate --seed',
                                            'all_commands'
                                        )
                                    }
                                    className="hover:text-white transition flex items-center gap-1"
                                >
                                    {copiedKey === 'all_commands' ? (
                                        <span className="text-emerald-400">Copied</span>
                                    ) : (
                                        <>
                                            <Copy className="w-3 h-3" />
                                            <span>Copy all</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            <div className="space-y-1.5 text-gray-300">
                                <p><span className="text-gray-500 select-none">$ </span>composer install</p>
                                <p><span className="text-gray-500 select-none">$ </span>npm install</p>
                                <p><span className="text-gray-500 select-none">$ </span>php artisan migrate --seed</p>
                                <p className="text-gray-500 pt-1"># Start development servers</p>
                                <p><span className="text-gray-500 select-none">$ </span>php artisan serve</p>
                                <p><span className="text-gray-500 select-none">$ </span>npm run dev</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Clean Footer */}
            <footer className="border-t border-gray-200/80 dark:border-white/[0.08] py-6 text-xs text-gray-500 dark:text-gray-400">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <ApplicationLogo className="w-4 h-4 rounded" />
                        <span className="font-medium text-gray-800 dark:text-gray-200">Laravel RBAC Starter Template</span>
                    </div>

                    <div className="flex items-center gap-3 font-mono text-[11px]">
                        <span>PHP {phpVersion || '8.4'}</span>
                        <span>·</span>
                        <span>Laravel {laravelVersion || '12'}</span>
                        <span>·</span>
                        <span>Tailwind CSS</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
