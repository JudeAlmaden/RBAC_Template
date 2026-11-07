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
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                                done
                                    ? 'bg-emerald-500 text-white'
                                    : active
                                      ? 'bg-[#5B5FC7] text-white'
                                      : 'bg-gray-100 text-gray-400 dark:bg-[#22222A] dark:text-gray-500'
                            }`}
                        >
                            {done ? <Check className="h-3 w-3" /> : index + 1}
                        </span>
                        <span
                            className={`text-[11px] font-medium ${
                                active
                                    ? 'text-gray-900 dark:text-white'
                                    : 'text-gray-400 dark:text-gray-500'
                            }`}
                        >
                            {step}
                        </span>
                        {index < steps.length - 1 && (
                            <span className="h-px flex-1 bg-[#E8E8EC] dark:bg-[#26262D]" />
                        )}
                    </li>
                );
            })}
        </ol>
    );
}
