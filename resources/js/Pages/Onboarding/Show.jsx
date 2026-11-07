import PasswordField from '@/Components/Auth/PasswordField';
import PasswordRequirements from '@/Components/Auth/PasswordRequirements';
import SetupProgress from '@/Components/Auth/SetupProgress';
import PrimaryButton from '@/Components/PrimaryButton';
import SetupLayout from '@/Layouts/SetupLayout';
import { Head, useForm } from '@inertiajs/react';

export default function Show({ name, email, submitUrl }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
        password_confirmation: '',
    });

    const submit = (event) => {
        event.preventDefault();

        post(submitUrl, {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <SetupLayout>
            <Head title="Choose your password" />

            <SetupProgress steps={['Your account', 'Set password']} current={1} />

            <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                Choose your password
            </h1>
            <p className="mt-1 mb-5 text-xs text-gray-500 dark:text-gray-400">
                Welcome, {name}. This password signs you in to{' '}
                <span className="font-medium text-gray-700 dark:text-gray-300">{email}</span>.
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
                    {processing ? 'Saving...' : 'Save password & continue'}
                </PrimaryButton>
            </form>
        </SetupLayout>
    );
}
