import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { MessageSquareWarning } from 'lucide-react';

export default function ReportProblem() {
    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h1 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">Report a Problem</h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Help us improve by reporting issues or feedback</p>
                </div>
            }
        >
            <Head title="Report a Problem" />

            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-5">
                <div className="w-20 h-20 rounded-2xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center">
                    <MessageSquareWarning className="w-9 h-9 text-amber-500 dark:text-amber-400" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Report a Problem</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
                        Encountered a bug or issue? Let us know so we can fix it and improve your learning experience.
                    </p>
                </div>
                <div className="px-4 py-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/30 text-amber-700 dark:text-amber-400 text-xs font-medium">
                    Coming Soon — Under Construction
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

