import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Dashboard() {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-bold text-body-main tracking-tight">
                            Dashboard
                        </h1>
                        <p className="text-xs text-body-muted">
                            System performance, user access statistics, and live activity metrics
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="space-y-6">
                {/* 1. Metric Cards Skeleton (4 columns) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className="bg-canvas-card rounded-xl border border-line p-5 shadow-xs"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-9 h-9 rounded-xl bg-canvas-muted animate-pulse" />
                                <div className="w-14 h-4 rounded-full bg-canvas-surface animate-pulse" />
                            </div>
                            <div className="space-y-2">
                                <div className="h-6 w-20 rounded-md bg-canvas-muted animate-pulse" />
                                <div className="h-3 w-28 rounded bg-canvas-surface animate-pulse" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* 2. Middle Section: Simulated Chart Skeleton (2/3) + Activity Feed Skeleton (1/3) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Simulated Analytics Chart Skeleton */}
                    <div className="lg:col-span-2 bg-canvas-card rounded-xl border border-line p-5 shadow-xs">
                        <div className="flex items-center justify-between mb-6">
                            <div className="space-y-1.5">
                                <div className="h-4 w-40 rounded bg-canvas-muted animate-pulse" />
                                <div className="h-2.5 w-56 rounded bg-canvas-surface animate-pulse" />
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-12 h-6 rounded-md bg-canvas-surface animate-pulse" />
                                <div className="w-12 h-6 rounded-md bg-canvas-surface animate-pulse" />
                                <div className="w-12 h-6 rounded-md bg-canvas-muted animate-pulse" />
                            </div>
                        </div>

                        {/* Bar Chart Bars */}
                        <div className="h-52 flex items-end justify-between gap-2 pt-6 px-2 border-b border-line">
                            {[35, 60, 45, 80, 65, 40, 90, 75, 50, 85, 95, 70].map((height, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                                    <div
                                        style={{ height: `${height}%` }}
                                        className="w-full max-w-[28px] rounded-t-md bg-canvas-surface hover:bg-canvas-muted transition-all animate-pulse"
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between pt-3 text-[10px] text-body-subtle">
                            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m) => (
                                <span key={m} className="w-6 text-center">{m}</span>
                            ))}
                        </div>
                    </div>

                    {/* Activity Feed Skeleton */}
                    <div className="bg-canvas-card rounded-xl border border-line p-5 shadow-xs flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-5">
                                <div className="h-4 w-32 rounded bg-canvas-muted animate-pulse" />
                                <div className="h-3 w-12 rounded bg-canvas-surface animate-pulse" />
                            </div>

                            <div className="space-y-4">
                                {[1, 2, 3, 4].map((item) => (
                                    <div key={item} className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-canvas-muted animate-pulse shrink-0" />
                                        <div className="min-w-0 flex-1 space-y-1.5">
                                            <div className="h-3 w-3/4 rounded bg-canvas-muted animate-pulse" />
                                            <div className="h-2.5 w-1/2 rounded bg-canvas-surface animate-pulse" />
                                        </div>
                                        <div className="w-10 h-3 rounded bg-canvas-surface animate-pulse shrink-0" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4 mt-4 border-t border-line">
                            <div className="h-8 w-full rounded-lg bg-canvas-surface animate-pulse" />
                        </div>
                    </div>
                </div>

                {/* 3. Table Skeleton (Full Width) */}
                <div className="bg-canvas-card rounded-xl border border-line shadow-xs overflow-hidden">
                    {/* Table Filter Bar Skeleton */}
                    <div className="p-4 border-b border-line flex items-center justify-between gap-4">
                        <div className="w-48 h-8 rounded-lg bg-canvas-surface animate-pulse" />
                        <div className="flex items-center gap-2">
                            <div className="w-20 h-8 rounded-lg bg-canvas-surface animate-pulse" />
                            <div className="w-24 h-8 rounded-lg bg-canvas-muted animate-pulse" />
                        </div>
                    </div>

                    {/* Table Rows Skeleton */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-line bg-canvas-surface">
                                    <th className="py-3.5 px-5 w-[35%]">
                                        <div className="h-3 w-20 rounded bg-canvas-muted animate-pulse" />
                                    </th>
                                    <th className="py-3.5 px-5 w-[25%]">
                                        <div className="h-3 w-16 rounded bg-canvas-muted animate-pulse" />
                                    </th>
                                    <th className="py-3.5 px-5 w-[20%]">
                                        <div className="h-3 w-14 rounded bg-canvas-muted animate-pulse" />
                                    </th>
                                    <th className="py-3.5 px-5 text-right w-[20%]">
                                        <div className="h-3 w-12 rounded bg-canvas-muted animate-pulse ml-auto" />
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-line">
                                {[1, 2, 3, 4].map((row) => (
                                    <tr key={row}>
                                        <td className="py-3.5 px-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-7 h-7 rounded-full bg-canvas-muted animate-pulse shrink-0" />
                                                <div className="space-y-1.5 min-w-0 flex-1">
                                                    <div className="h-3 w-28 rounded bg-canvas-muted animate-pulse" />
                                                    <div className="h-2.5 w-36 rounded bg-canvas-surface animate-pulse" />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-5">
                                            <div className="h-5 w-20 rounded-md bg-canvas-surface animate-pulse" />
                                        </td>
                                        <td className="py-3.5 px-5">
                                            <div className="h-5 w-16 rounded-full bg-canvas-surface animate-pulse" />
                                        </td>
                                        <td className="py-3.5 px-5 text-right">
                                            <div className="h-7 w-16 rounded-lg bg-canvas-surface animate-pulse ml-auto" />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Table Pagination Bar Skeleton */}
                    <div className="p-3.5 border-t border-line flex items-center justify-between">
                        <div className="h-3 w-32 rounded bg-canvas-surface animate-pulse" />
                        <div className="flex items-center gap-1.5">
                            <div className="w-6 h-6 rounded bg-canvas-surface animate-pulse" />
                            <div className="w-6 h-6 rounded bg-canvas-muted animate-pulse" />
                            <div className="w-6 h-6 rounded bg-canvas-surface animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
