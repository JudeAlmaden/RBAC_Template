import { Check } from 'lucide-react';

export default function SetupProgress({ steps = [], current = 0 }) {
    return (
        <ol className="mb-5 flex items-center gap-2">
            {steps.map((step, index) => {
                const isDone = index < current;
                const isCurrent = index === current;

                return (
                    <li key={step} className="flex flex-1 items-center gap-2">
                        <span
                            className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold shrink-0 ${
                                isDone || isCurrent
                                    ? 'bg-brand text-white'
                                    : 'bg-canvas-muted text-body-subtle'
                            }`}
                        >
                            {isDone ? <Check className="h-3 w-3 stroke-[3]" /> : index + 1}
                        </span>
                        <span
                            className={`text-[11px] truncate ${
                                isCurrent ? 'font-semibold text-body-main' : 'text-body-muted'
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
