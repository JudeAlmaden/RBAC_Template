import { Link } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#FBFBFC] dark:bg-[#0D0D12] text-[#111111] dark:text-[#F8F9FD] p-4 sm:p-6 font-sans antialiased">
            <div className="mb-6 flex flex-col items-center">
                <Link href="/" className="flex items-center gap-2.5">
                    <ApplicationLogo className="w-8 h-8" />
                    <span className="font-bold text-lg text-gray-900 dark:text-white tracking-tight">
                        Template
                    </span>
                </Link>
            </div>

            <div className="w-full sm:max-w-md bg-white dark:bg-[#15151A] p-6 sm:p-8 rounded-xl border border-[#E8E8EC] dark:border-[#26262D] shadow-gumloop-card">
                {children}
            </div>
        </div>
    );
}
