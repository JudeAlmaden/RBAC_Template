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

        // submitUrl is signed by the server; never rebuild it on the client.
        post(submitUrl, {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <SetupLayout>
            <Head title="Choose your password" />
            <SetupProgress steps={['Your account', 'Set password']} current={1} />

            <h1 className="text-lg font-bold text-body-main">Choose your password</h1>
            <p className="mt-1 mb-5 text-xs text-body-muted">
                Welcome, {name}. This password signs you in to {email}.
            </p>

            <form onSubmit={submit} className="space-y-4">
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

                <PrimaryButton className="w-full" disabled={processing}>
                    {processing ? 'Saving...' : 'Save password & continue'}
                </PrimaryButton>
            </form>
        </SetupLayout>
    );
}
