import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Award } from 'lucide-react';

export default function Credentials() {
    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h1 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">My Credentials</h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Your earned certifications, badges, and achievements</p>
                </div>
            }
        >
            <Head title="My Credentials" />

            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-5">
                <div className="w-20 h-20 rounded-2xl bg-[#4A91CC]/10 dark:bg-[#4A91CC]/20 flex items-center justify-center">
                    <Award className="w-9 h-9 text-[#4A91CC] dark:text-[#65A9E3]" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">My Credentials</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
                        Your earned certifications, digital badges, and course completion credentials will appear here.
                    </p>
                </div>
                <div className="px-4 py-2 rounded-lg bg-blue-50 dark:bg-[#203B56] border border-blue-200/60 dark:border-blue-800/30 text-[#4A91CC] dark:text-[#65A9E3] text-xs font-medium">
                    Coming Soon — Under Construction
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

