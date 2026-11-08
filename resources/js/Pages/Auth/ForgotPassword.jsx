import { useState } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import SetupLayout from '@/Layouts/SetupLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { MailCheck } from 'lucide-react';

export default function ForgotPassword({ status, resetEmail }) {
    const { data, setData, post, processing, errors } = useForm({
        email: resetEmail || '',
    });

    const [sent, setSent] = useState(Boolean(status));
    const [sentTo, setSentTo] = useState(resetEmail || '');

    const submit = (e) => {
        e.preventDefault();

        post(route('password.email'), {
            onSuccess: () => {
                setSentTo(data.email);
                setSent(true);
            },
        });
    };

    const startOver = () => {
        setSent(false);
        setData('email', '');
    };

    return (
        <SetupLayout>
            <Head title="Forgot Password" />

            {sent ? (
                <div className="text-center">
                    <span className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                        <MailCheck className="h-5 w-5" />
                    </span>

                    <h1 className="text-lg font-bold text-body-main">Check your inbox</h1>
                    <p className="mt-1 text-xs text-body-muted">
                        If an account exists for{' '}
                        <span className="font-semibold text-body-main">{sentTo}</span>, we just sent a
                        password reset link. It expires in 60 minutes.
                    </p>

                    <button
                        type="button"
                        onClick={startOver}
                        className="mt-4 text-xs font-semibold text-brand hover:text-brand-hover transition"
                    >
                        Use a different address
                    </button>
                </div>
            ) : (
                <>
                    <h1 className="text-lg font-bold text-body-main">Forgot your password?</h1>
                    <p className="mt-1 mb-5 text-xs text-body-muted">
                        Enter your email address and we will send you a link to choose a new password.
                    </p>

                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <InputLabel htmlFor="email" value="Email address" />

                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="mt-1 block w-full"
                                autoComplete="username"
                                isFocused={true}
                                onChange={(e) => setData('email', e.target.value)}
                            />

                            <InputError message={errors.email} className="mt-1" />
                        </div>

                        <PrimaryButton className="w-full" disabled={processing}>
                            {processing ? 'Sending...' : 'Email password reset link'}
                        </PrimaryButton>
                    </form>

                    <p className="mt-4 text-center text-[11px] text-body-subtle">
                        <Link href={route('login')} className="font-semibold text-brand hover:text-brand-hover">
                            Back to sign in
                        </Link>
                    </p>
                </>
            )}
        </SetupLayout>
    );
}
