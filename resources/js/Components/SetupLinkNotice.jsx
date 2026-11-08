import { useState } from 'react';
import { usePage } from '@inertiajs/react';
import { AlertTriangle, Check, Copy, Link2 } from 'lucide-react';

/**
 * Renders the freshly issued setup link flashed after creating an account or
 * issuing a forced reset. Never claims mail was delivered when it was not.
 */
export default function SetupLinkNotice() {
    const { flash } = usePage().props;
    const [copied, setCopied] = useState(false);

    const setupLink = flash?.setup_link;
    const emailed = Boolean(flash?.setup_link_emailed);

    if (!setupLink) {
        return null;
    }

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(setupLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            setCopied(false);
        }
    };

    return (
        <div className="rounded-xl border border-line bg-canvas-card p-4 shadow-sm">
            <div className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-brand/10 text-brand">
                    <Link2 className="w-3.5 h-3.5" />
                </span>

                <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-body-main">
                        Password setup link
                    </p>

                    {emailed ? (
                        <p className="mt-0.5 text-[11px] text-body-muted">
                            Also emailed to the account holder. The link expires in 72 hours and works once.
                        </p>
                    ) : (
                        <p className="mt-0.5 flex items-start gap-1.5 text-[11px] text-amber-700 dark:text-amber-400">
                            <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
                            <span>Mail is not configured — share this link manually. It expires in 72 hours and works once.</span>
                        </p>
                    )}

                    <div className="mt-2.5 flex items-center gap-2">
                        <input
                            type="text"
                            readOnly
                            value={setupLink}
                            onFocus={(e) => e.target.select()}
                            className="w-full rounded-lg border border-line bg-canvas-surface px-2.5 py-1.5 font-mono text-[10px] text-body-main focus:outline-none focus:ring-1 focus:ring-brand"
                        />
                        <button
                            type="button"
                            onClick={copy}
                            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-line bg-canvas-card px-2.5 py-1.5 text-[11px] font-semibold text-body-main transition hover:bg-canvas-hover"
                        >
                            {copied ? (
                                <>
                                    <Check className="w-3 h-3 text-emerald-500" />
                                    Copied
                                </>
                            ) : (
                                <>
                                    <Copy className="w-3 h-3" />
                                    Copy
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
