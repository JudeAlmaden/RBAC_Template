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
        <ul className="space-y-1.5 rounded-lg border border-[#E8E8EC] dark:border-[#26262D] bg-[#FAFAFC] dark:bg-[#121217] p-3">
            {checks.map((check) => (
                <li key={check.id} className="flex items-center gap-2 text-[11px]">
                    <span
                        className={`flex h-4 w-4 items-center justify-center rounded-full ${
                            check.met
                                ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                                : 'bg-gray-100 text-gray-400 dark:bg-[#22222A] dark:text-gray-500'
                        }`}
                    >
                        {check.met ? (
                            <Check className="h-2.5 w-2.5 stroke-[3]" />
                        ) : (
                            <X className="h-2.5 w-2.5 stroke-[3]" />
                        )}
                    </span>
                    <span
                        className={
                            check.met
                                ? 'text-gray-700 dark:text-gray-300'
                                : 'text-gray-500 dark:text-gray-400'
                        }
                    >
                        {check.label}
                    </span>
                </li>
            ))}
        </ul>
    );
}
