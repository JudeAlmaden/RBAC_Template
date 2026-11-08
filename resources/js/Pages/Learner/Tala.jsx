import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Sparkles } from 'lucide-react';

export default function Tala() {
    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h1 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">TALA</h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Your AI-powered learning assistant</p>
                </div>
            }
        >
            <Head title="TALA — AI Assistant" />

            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-5">
                <div className="w-20 h-20 rounded-2xl bg-accent/10 dark:bg-accent/20 flex items-center justify-center">
                    <Sparkles className="w-9 h-9 text-accent-light" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">TALA</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
                        TALA is your AI-powered learning assistant, ready to explain concepts, answer questions, and guide your learning journey.
                    </p>
                </div>
                <div className="px-4 py-2 rounded-lg bg-blue-50 dark:bg-raised border border-blue-200/60 dark:border-blue-800/30 text-accent-light text-xs font-medium">
                    Coming Soon — Under Construction
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

