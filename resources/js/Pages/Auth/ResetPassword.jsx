import InputError from '@/Components/InputError';
import PasswordField from '@/Components/Auth/PasswordField';
import PasswordRequirements from '@/Components/Auth/PasswordRequirements';
import PrimaryButton from '@/Components/PrimaryButton';
import SetupLayout from '@/Layouts/SetupLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { AlertCircle } from 'lucide-react';

export default function ResetPassword({ token, email, invalidReason = null }) {
    // Hooks must run before any early return.
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    if (invalidReason) {
        return (
            <SetupLayout>
                <Head title="Reset Password" />

                <div className="text-center">
                    <span className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
                        <AlertCircle className="h-5 w-5" />
                    </span>

                    <h1 className="text-lg font-bold text-body-main">This link is incomplete</h1>
                    <p className="mt-1 text-xs text-body-muted">
                        The reset link is missing its email address or token. Request a new link to continue.
                    </p>

                    <Link
                        href={route('password.request')}
                        className="mt-4 inline-block text-xs font-semibold text-brand hover:text-brand-hover transition"
                    >
                        Request a new reset link
                    </Link>
                </div>
            </SetupLayout>
        );
    }

    return (
        <SetupLayout>
            <Head title="Reset Password" />

            <h1 className="text-lg font-bold text-body-main">Choose a new password</h1>
            <p className="mt-1 mb-5 text-xs text-body-muted">
                Setting a new password for{' '}
                <span className="font-semibold text-body-main">{data.email}</span>.
            </p>

            <form onSubmit={submit} className="space-y-4">
                <input type="hidden" name="email" value={data.email} readOnly />

                <PasswordField
                    id="password"
                    label="New password"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    error={errors.password}
                    isFocused
                />

                <PasswordField
                    id="password_confirmation"
                    label="Confirm password"
                    value={data.password_confirmation}
                    onChange={(e) => setData('password_confirmation', e.target.value)}
                    error={errors.password_confirmation}
                />

                <PasswordRequirements
                    password={data.password}
                    confirmation={data.password_confirmation}
                />

                <InputError message={errors.email} />

                <PrimaryButton className="w-full" disabled={processing}>
                    {processing ? 'Saving...' : 'Save password & sign in'}
                </PrimaryButton>
            </form>
        </SetupLayout>
    );
}
