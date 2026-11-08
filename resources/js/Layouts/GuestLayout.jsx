import { Link, usePage } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { AlertCircle, AlertTriangle } from 'lucide-react';

const appName = import.meta.env.VITE_APP_NAME || 'Nexus';

export default function GuestLayout({ children }) {
    const { flash } = usePage().props;

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-surface dark:bg-page text-ink p-4 sm:p-6 font-sans antialiased">
            <div className="mb-6 flex flex-col items-center">
                <Link href="/" className="flex items-center gap-2.5">
                    <ApplicationLogo className="w-8 h-8" />
                    <span className="font-bold text-lg text-gray-900 dark:text-white tracking-tight">
                        {appName}
                    </span>
                </Link>
            </div>

            <div className="w-full sm:max-w-md bg-surface p-6 sm:p-8 rounded-xl border border-line shadow-gumloop-card">
                {flash?.error && (
                    <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 p-3 text-xs text-red-700 dark:text-red-300">
                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                        <span>{flash.error}</span>
                    </div>
                )}

                {flash?.warning && (
                    <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/30 p-3 text-xs text-amber-700 dark:text-amber-300">
                        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                        <span>{flash.warning}</span>
                    </div>
                )}

                {children}
            </div>
        </div>
    );
}
