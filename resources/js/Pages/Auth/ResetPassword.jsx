import PasswordField from '@/Components/Auth/PasswordField';
import PasswordRequirements from '@/Components/Auth/PasswordRequirements';
import PrimaryButton from '@/Components/PrimaryButton';
import SetupLayout from '@/Layouts/SetupLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { AlertTriangle } from 'lucide-react';

export default function ResetPassword({ token, email, invalidReason = null }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token ?? '',
        email: email ?? '',
        password: '',
        password_confirmation: '',
    });

    const submit = (event) => {
        event.preventDefault();

        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    if (invalidReason) {
        return (
            <SetupLayout>
                <Head title="Reset link invalid" />

                <div className="text-center">
                    <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-950/40">
                        <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>

                    <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                        This reset link is incomplete
                    </h1>
                    <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                        Reset links expire after 60 minutes and can only be used once.
                        Request a fresh one to continue.
                    </p>

                    <Link
                        href={route('password.request')}
                        className="mt-5 inline-flex items-center justify-center rounded-lg bg-[#5B5FC7] px-4 py-2 text-xs font-semibold text-white hover:bg-[#484CB8] transition"
                    >
                        Request a new link
                    </Link>
                </div>
            </SetupLayout>
        );
    }

    return (
        <SetupLayout>
            <Head title="Reset Password" />

            <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                Choose a new password
            </h1>
            <p className="mt-1 mb-5 text-xs text-gray-500 dark:text-gray-400">
                Signing in as{' '}
                <span className="font-medium text-gray-700 dark:text-gray-300">
                    {email}
                </span>
                .
            </p>

            <form onSubmit={submit} className="space-y-4">
                <PasswordField
                    id="password"
                    label="New password"
                    value={data.password}
                    onChange={(event) => setData('password', event.target.value)}
                    error={errors.password}
                    isFocused
                />

                <PasswordField
                    id="password_confirmation"
                    label="Confirm password"
                    value={data.password_confirmation}
                    onChange={(event) =>
                        setData('password_confirmation', event.target.value)
                    }
                    error={errors.password_confirmation}
                />

                <PasswordRequirements
                    password={data.password}
                    confirmation={data.password_confirmation}
                />

                <PrimaryButton className="w-full" disabled={processing}>
                    {processing ? 'Saving...' : 'Reset password'}
                </PrimaryButton>
            </form>

            <Link
                href={route('login')}
                className="mt-4 block text-center text-[11px] font-medium text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            >
                Back to sign in
            </Link>
        </SetupLayout>
    );
}
