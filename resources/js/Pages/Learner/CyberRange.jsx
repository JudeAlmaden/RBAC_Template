import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Crosshair, Terminal, Wifi } from 'lucide-react';

export default function CyberRange() {
    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h1 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">Cyber Range</h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Hands-on cybersecurity lab environment</p>
                </div>
            }
        >
            <Head title="Cyber Range" />

            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-5">
                <div className="w-20 h-20 rounded-2xl bg-[#4A91CC]/10 dark:bg-[#4A91CC]/20 flex items-center justify-center">
                    <Crosshair className="w-9 h-9 text-[#4A91CC] dark:text-[#65A9E3]" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Cyber Range</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
                        The hands-on lab environment is coming soon. Practice real-world cybersecurity skills in a controlled sandbox.
                    </p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/30 text-amber-700 dark:text-amber-400 text-xs font-medium">
                    <Terminal className="w-3.5 h-3.5" />
                    Coming Soon — Under Construction
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

