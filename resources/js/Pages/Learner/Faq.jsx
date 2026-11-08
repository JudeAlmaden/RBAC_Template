import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { HelpCircle } from 'lucide-react';

export default function Faq() {
    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h1 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">FAQ</h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Frequently asked questions and academy help</p>
                </div>
            }
        >
            <Head title="FAQ" />

            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-5">
                <div className="w-20 h-20 rounded-2xl bg-accent/10 dark:bg-accent/20 flex items-center justify-center">
                    <HelpCircle className="w-9 h-9 text-accent-light" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Frequently Asked Questions</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
                        Find answers to common questions about FusionNode Academy, your courses, and the platform.
                    </p>
                </div>
                <div className="px-4 py-2 rounded-lg bg-blue-50 dark:bg-raised border border-blue-200/60 dark:border-blue-800/30 text-accent-light text-xs font-medium">
                    Coming Soon — Under Construction
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

