import { Check } from 'lucide-react';

export default function SetupProgress({ steps = [], current = 0 }) {
    return (
        <ol className="mb-5 flex items-center gap-2">
            {steps.map((step, index) => {
                const done = index < current;
                const active = index === current;

                return (
                    <li key={step} className="flex flex-1 items-center gap-2">
                        <span
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[0.625rem] font-bold ${
                                done
                                    ? 'bg-emerald-500 text-white'
                                    : active
                                      ? 'bg-accent text-white'
                                      : 'bg-gray-100 text-gray-400 dark:bg-raised dark:text-gray-500'
                            }`}
                        >
                            {done ? <Check className="h-3 w-3" /> : index + 1}
                        </span>
                        <span
                            className={`text-[0.6875rem] font-medium ${
                                active
                                    ? 'text-gray-900 dark:text-white'
                                    : 'text-gray-400 dark:text-gray-500'
                            }`}
                        >
                            {step}
                        </span>
                        {index < steps.length - 1 && (
                            <span className="h-px flex-1 bg-line" />
                        )}
                    </li>
                );
            })}
        </ol>
    );
}
