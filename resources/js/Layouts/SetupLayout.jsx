import ApplicationLogo from '@/Components/ApplicationLogo';
import { useTheme } from '@/hooks/useTheme';
import { usePage } from '@inertiajs/react';
import { AlertCircle, AlertTriangle, Moon, Sun } from 'lucide-react';

export default function SetupLayout({ children }) {
    const { dark, toggleDark } = useTheme();
    const { flash } = usePage().props;

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-canvas-page text-body-main p-4 sm:p-6 font-sans antialiased relative">
            <button
                type="button"
                onClick={toggleDark}
                className="absolute top-4 right-4 p-2 rounded-lg border border-line bg-canvas-card text-body-muted hover:text-body-main hover:bg-canvas-hover transition"
                title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
                {dark ? <Sun className="w-4 h-4 text-brand" /> : <Moon className="w-4 h-4" />}
            </button>

            <div className="mb-6 flex flex-col items-center">
                <div className="flex items-center gap-2.5">
                    <ApplicationLogo className="w-8 h-8" />
                    <span className="font-bold text-lg text-body-main tracking-tight">
                        Template
                    </span>
                </div>
            </div>

            <div className="w-full sm:max-w-md bg-canvas-card p-6 sm:p-8 rounded-xl border border-line shadow-card">
                {flash?.error && (
                    <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                        <span>{flash.error}</span>
                    </div>
                )}

                {flash?.warning && (
                    <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700 dark:border-amber-800/60 dark:bg-amber-950/30 dark:text-amber-300">
                        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                        <span>{flash.warning}</span>
                    </div>
                )}

                {children}
            </div>

            <p className="mt-6 text-[11px] text-body-subtle">
                Need help? Contact your administrator.
            </p>
        </div>
    );
}
