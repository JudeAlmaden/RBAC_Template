import { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { Check, Copy, Link2, MailCheck } from 'lucide-react';

export default function SetupLinkNotice() {
    const { flash } = usePage().props;
    const link = flash?.setup_link;
    const emailed = flash?.setup_link_emailed;

    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!copied) return undefined;

        const timer = setTimeout(() => setCopied(false), 2000);

        return () => clearTimeout(timer);
    }, [copied]);

    if (!link) return null;

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(link);
            setCopied(true);
        } catch {
            // Clipboard access can be blocked; the link is still selectable.
        }
    };

    return (
        <div className="rounded-xl border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/60 dark:bg-indigo-950/20 p-4">
            <div className="flex items-start gap-2.5">
                {emailed ? (
                    <MailCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                ) : (
                    <Link2 className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
                )}

                <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-gray-900 dark:text-white">
                        {emailed
                            ? 'Setup link emailed'
                            : 'Mail is not configured — share this link manually'}
                    </p>
                    <p className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">
                        Single use, expires in 72 hours. Setting a password invalidates it.
                    </p>

                    <div className="mt-2 flex items-center gap-2">
                        <input
                            readOnly
                            value={link}
                            onFocus={(event) => event.target.select()}
                            className="w-full rounded-lg border border-[#E8E8EC] dark:border-[#26262D] bg-white dark:bg-[#15151A] px-2.5 py-1.5 text-[11px] text-gray-700 dark:text-gray-300"
                        />

                        <button
                            type="button"
                            onClick={copy}
                            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#5B5FC7] px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-[#484CB8] transition"
                        >
                            {copied ? (
                                <Check className="h-3 w-3" />
                            ) : (
                                <Copy className="h-3 w-3" />
                            )}
                            {copied ? 'Copied' : 'Copy'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
