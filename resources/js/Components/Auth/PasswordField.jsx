import { useState } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { Eye, EyeOff } from 'lucide-react';

export default function PasswordField({
    id,
    label,
    value,
    onChange,
    error,
    hint,
    autoComplete = 'new-password',
    isFocused = false,
}) {
    const [visible, setVisible] = useState(false);

    return (
        <div>
            <div className="flex items-center justify-between">
                <InputLabel htmlFor={id} value={label} />

                <button
                    type="button"
                    onClick={() => setVisible((current) => !current)}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition"
                    aria-label={visible ? 'Hide password' : 'Show password'}
                >
                    {visible ? (
                        <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                        <Eye className="h-3.5 w-3.5" />
                    )}
                    {visible ? 'Hide' : 'Show'}
                </button>
            </div>

            <TextInput
                id={id}
                name={id}
                type={visible ? 'text' : 'password'}
                value={value}
                onChange={onChange}
                className="mt-1 block w-full"
                autoComplete={autoComplete}
                isFocused={isFocused}
            />

            {hint && (
                <p className="mt-1 text-[11px] text-gray-400 dark:text-gray-500">{hint}</p>
            )}

            <InputError message={error} className="mt-1" />
        </div>
    );
}
