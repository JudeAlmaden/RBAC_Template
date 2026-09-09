import { Head, Link } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { ArrowRight, Shield, Users, Activity, Sparkles, Lock, Layers } from 'lucide-react';

export default function Welcome({ auth }) {
    return (
        <div className="min-h-screen bg-[#FBFBFC] dark:bg-[#0D0D12] text-gray-900 dark:text-gray-100 flex flex-col justify-between selection:bg-[#5B5FC7] selection:text-white">
            <Head title="Welcome" />

            {/* Top Navigation */}
            <header className="h-16 border-b border-[#E8E8EC] dark:border-[#26262D] bg-white/80 dark:bg-[#15151A]/80 backdrop-blur-md sticky top-0 z-30">
                <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <ApplicationLogo className="w-8 h-8" />
                        <span className="font-bold text-base text-gray-900 dark:text-white tracking-tight">
                            Template
                        </span>
                    </div>

                    <nav className="flex items-center gap-3">
                        {auth?.user ? (
                            <Link
                                href={route('dashboard')}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#5B5FC7] hover:bg-[#484CB8] text-white text-xs font-semibold shadow-sm transition"
                            >
                                <span>Dashboard</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        ) : (
                            <Link
                                href={route('login')}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#5B5FC7] hover:bg-[#484CB8] text-white text-xs font-semibold shadow-sm transition"
                            >
                                <span>Sign In</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        )}
                    </nav>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1">
                {/* Hero Section */}
                <section className="pt-16 pb-10 px-4 sm:px-6 lg:px-8 text-center max-w-4xl mx-auto space-y-5">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-[#5B5FC7]/10 text-[#5B5FC7] dark:text-[#8A8DE2] border border-[#5B5FC7]/20">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Modern Laravel & Inertia React Architecture</span>
                    </div>

                    <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight">
                        Template Application
                    </h1>

                    <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 leading-relaxed max-w-xl mx-auto">
                        A clean foundation and starter boilerplate for building scalable web applications with advanced RBAC, PBAC authorization, and audit logging.
                    </p>

                    <div className="pt-2 flex items-center justify-center gap-3">
                        {auth?.user ? (
                            <Link
                                href={route('dashboard')}
                                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-[#5B5FC7] hover:bg-[#484CB8] text-white font-semibold text-xs shadow-sm transition"
                            >
                                <span>Go to Dashboard</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        ) : (
                            <Link
                                href={route('login')}
                                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-[#5B5FC7] hover:bg-[#484CB8] text-white font-semibold text-xs shadow-sm transition"
                            >
                                <span>Sign In to Continue</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        )}
                    </div>
                </section>

                {/* App Window Preview with Skeletons */}
                <section className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                    {/* Ambient Glow */}
                    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 h-64 bg-gradient-to-tr from-[#5B5FC7]/20 via-purple-500/10 to-indigo-500/20 blur-3xl rounded-full pointer-events-none -z-10" />

                    {/* Window Container */}
                    <div className="rounded-2xl border border-[#E8E8EC] dark:border-[#26262D] bg-white dark:bg-[#15151A] shadow-2xl overflow-hidden">
                        {/* Chrome Titlebar */}
                        <div className="h-10 px-4 border-b border-[#E8E8EC] dark:border-[#26262D] bg-[#FAFAFC] dark:bg-[#1C1C24] flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-400/80" />
                                <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                                <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
                            </div>
                            <div className="w-56 sm:w-72 h-5 rounded-md bg-gray-200/70 dark:bg-[#252532] flex items-center px-2.5 text-[10px] text-gray-400 dark:text-gray-500 font-mono truncate">
                                app.template.io/dashboard
                            </div>
                            <div className="w-8" />
                        </div>

                        {/* Skeleton Interface Preview */}
                        <div className="p-5 sm:p-7 space-y-5 bg-[#FBFBFC]/60 dark:bg-[#111116]/60">
                            {/* Metric Cards Skeleton */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                                {[1, 2, 3].map((i) => (
                                    <div
                                        key={i}
                                        className="bg-white dark:bg-[#15151A] rounded-xl border border-[#E8E8EC] dark:border-[#26262D] p-4 shadow-xs space-y-3"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="w-7 h-7 rounded-lg bg-gray-200 dark:bg-[#22222C] animate-pulse" />
                                            <div className="w-12 h-3.5 rounded-full bg-gray-100 dark:bg-[#1C1C24] animate-pulse" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <div className="h-5 w-16 rounded bg-gray-200 dark:bg-[#22222C] animate-pulse" />
                                            <div className="h-2.5 w-24 rounded bg-gray-100 dark:bg-[#1C1C24] animate-pulse" />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Middle Analytics Chart & Feed Skeletons */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                {/* Chart Skeleton */}
                                <div className="lg:col-span-2 bg-white dark:bg-[#15151A] rounded-xl border border-[#E8E8EC] dark:border-[#26262D] p-4.5 shadow-xs space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <div className="h-3.5 w-28 rounded bg-gray-200 dark:bg-[#22222C] animate-pulse" />
                                            <div className="h-2 w-40 rounded bg-gray-100 dark:bg-[#1C1C24] animate-pulse" />
                                        </div>
                                        <div className="flex gap-1">
                                            <div className="w-10 h-5 rounded bg-gray-100 dark:bg-[#1C1C24] animate-pulse" />
                                            <div className="w-10 h-5 rounded bg-gray-200 dark:bg-[#22222C] animate-pulse" />
                                        </div>
                                    </div>
                                    <div className="h-32 flex items-end justify-between gap-2 pt-3 px-1 border-b border-[#E8E8EC] dark:border-[#26262D]">
                                        {[40, 65, 50, 85, 70, 45, 90, 80, 55, 95].map((h, idx) => (
                                            <div key={idx} className="flex-1 flex justify-center h-full items-end">
                                                <div
                                                    style={{ height: `${h}%` }}
                                                    className="w-full max-w-[20px] rounded-t bg-gray-200/80 dark:bg-[#22222C] animate-pulse"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Feed Skeleton */}
                                <div className="bg-white dark:bg-[#15151A] rounded-xl border border-[#E8E8EC] dark:border-[#26262D] p-4.5 shadow-xs space-y-3.5">
                                    <div className="flex items-center justify-between">
                                        <div className="h-3.5 w-24 rounded bg-gray-200 dark:bg-[#22222C] animate-pulse" />
                                        <div className="h-2.5 w-8 rounded bg-gray-100 dark:bg-[#1C1C24] animate-pulse" />
                                    </div>
                                    <div className="space-y-3">
                                        {[1, 2, 3].map((item) => (
                                            <div key={item} className="flex items-center gap-2.5">
                                                <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-[#22222C] animate-pulse shrink-0" />
                                                <div className="flex-1 space-y-1 min-w-0">
                                                    <div className="h-2.5 w-3/4 rounded bg-gray-200 dark:bg-[#22222C] animate-pulse" />
                                                    <div className="h-2 w-1/2 rounded bg-gray-100 dark:bg-[#1C1C24] animate-pulse" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Table Skeleton Rows */}
                            <div className="rounded-xl border border-[#E8E8EC] dark:border-[#26262D] bg-white dark:bg-[#15151A] overflow-hidden">
                                <div className="p-3 border-b border-[#E8E8EC] dark:border-[#26262D] flex items-center justify-between">
                                    <div className="w-32 h-6 rounded bg-gray-100 dark:bg-[#1C1C24] animate-pulse" />
                                    <div className="w-16 h-6 rounded bg-gray-200 dark:bg-[#22222C] animate-pulse" />
                                </div>
                                <div className="divide-y divide-[#E8E8EC] dark:divide-[#26262D]">
                                    {[1, 2, 3].map((row) => (
                                        <div key={row} className="p-3 px-4 flex items-center justify-between">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-[#22222C] animate-pulse shrink-0" />
                                                <div className="space-y-1">
                                                    <div className="h-2.5 w-24 rounded bg-gray-200 dark:bg-[#22222C] animate-pulse" />
                                                    <div className="h-2 w-32 rounded bg-gray-100 dark:bg-[#1C1C24] animate-pulse" />
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-12 h-4 rounded-full bg-gray-100 dark:bg-[#1C1C24] animate-pulse" />
                                                <div className="w-14 h-5 rounded bg-gray-100 dark:bg-[#1C1C24] animate-pulse" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Highlight Grid */}
                <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div className="p-5 rounded-2xl border border-[#E8E8EC] dark:border-[#26262D] bg-white dark:bg-[#15151A] shadow-xs space-y-2.5">
                            <div className="w-9 h-9 rounded-xl bg-[#5B5FC7]/10 text-[#5B5FC7] dark:text-[#8A8DE2] flex items-center justify-center">
                                <Shield className="w-4 h-4" />
                            </div>
                            <h3 className="font-bold text-sm text-gray-900 dark:text-white">Role & Capacity Control</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                Fine-grained PBAC system with active user limits, permission scoping, and super admin ownership transfer.
                            </p>
                        </div>

                        <div className="p-5 rounded-2xl border border-[#E8E8EC] dark:border-[#26262D] bg-white dark:bg-[#15151A] shadow-xs space-y-2.5">
                            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                <Activity className="w-4 h-4" />
                            </div>
                            <h3 className="font-bold text-sm text-gray-900 dark:text-white">Audit & Activity Logging</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                Automatically logs account creations, role changes, privilege elevations, and status toggles with pagination.
                            </p>
                        </div>

                        <div className="p-5 rounded-2xl border border-[#E8E8EC] dark:border-[#26262D] bg-white dark:bg-[#15151A] shadow-xs space-y-2.5">
                            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                <Users className="w-4 h-4" />
                            </div>
                            <h3 className="font-bold text-sm text-gray-900 dark:text-white">Directory & Accounts</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                Filterable directory with modular account creation, role assignment, status management, and instant search.
                            </p>
                        </div>
                    </div>
                </section>
            </main>

            {/* Minimal Footer */}
            <footer className="border-t border-[#E8E8EC] dark:border-[#26262D] py-5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
                    <span>Template</span>
                    <span>Ready for development</span>
                </div>
            </footer>
        </div>
    );
}
