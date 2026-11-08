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
    isFocused = false,
    autoComplete = 'new-password',
}) {
    const [visible, setVisible] = useState(false);

    return (
        <div>
            <InputLabel htmlFor={id} value={label} />

            <div className="relative mt-1">
                <TextInput
                    id={id}
                    type={visible ? 'text' : 'password'}
                    value={value}
                    className="block w-full pr-10"
                    autoComplete={autoComplete}
                    isFocused={isFocused}
                    onChange={onChange}
                />

                <button
                    type="button"
                    onClick={() => setVisible((v) => !v)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-body-subtle hover:text-body-main transition"
                    title={visible ? 'Hide password' : 'Show password'}
                    aria-label={visible ? 'Hide password' : 'Show password'}
                >
                    {visible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
            </div>

            <InputError message={error} className="mt-1" />
        </div>
    );
}
