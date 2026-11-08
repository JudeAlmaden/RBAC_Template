import { Check, X } from 'lucide-react';
import {
    PASSWORD_MIN_LENGTH,
    doPasswordsMatch,
    isPasswordLongEnough,
} from '@/lib/passwordPolicy';

export default function PasswordRequirements({ password = '', confirmation = '' }) {
    const checks = [
        {
            id: 'length',
            label: `At least ${PASSWORD_MIN_LENGTH} characters`,
            met: isPasswordLongEnough(password),
        },
        {
            id: 'match',
            label: 'Both passwords match',
            met: doPasswordsMatch(password, confirmation),
        },
    ];

    return (
        <ul className="space-y-1.5 rounded-lg border border-line bg-canvas-surface p-3">
            {checks.map((check) => (
                <li key={check.id} className="flex items-center gap-2 text-[11px]">
                    <span
                        className={`flex h-4 w-4 items-center justify-center rounded-full ${
                            check.met
                                ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                                : 'bg-canvas-muted text-body-subtle'
                        }`}
                    >
                        {check.met ? (
                            <Check className="h-2.5 w-2.5 stroke-[3]" />
                        ) : (
                            <X className="h-2.5 w-2.5 stroke-[3]" />
                        )}
                    </span>
                    <span className={check.met ? 'text-body-main' : 'text-body-muted'}>
                        {check.label}
                    </span>
                </li>
            ))}
        </ul>
    );
}
