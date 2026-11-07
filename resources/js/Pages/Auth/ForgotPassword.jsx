import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { MailCheck } from 'lucide-react';
import { useState } from 'react';

export default function ForgotPassword({ status, resetEmail }) {
    const [sent, setSent] = useState(Boolean(status));

    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (event) => {
        event.preventDefault();

        post(route('password.email'), {
            preserveScroll: true,
            onSuccess: () => setSent(true),
        });
    };

    return (
        <GuestLayout>
            <Head title="Forgot Password" />

            {sent ? (
                <div className="text-center">
                    <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/40">
                        <MailCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>

                    <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                        Check your inbox
                    </h1>
                    <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                        If an account exists for{' '}
                        <span className="font-semibold text-gray-700 dark:text-gray-300">
                            {resetEmail || 'that address'}
                        </span>
                        , we sent a link to choose a new password. It expires in 60
                        minutes.
                    </p>

                    <button
                        type="button"
                        onClick={() => setSent(false)}
                        className="mt-5 text-xs font-semibold text-[#5B5FC7] hover:underline dark:text-[#8A8DE2]"
                    >
                        Use a different address
                    </button>
                </div>
            ) : (
                <>
                    <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                        Forgot your password?
                    </h1>
                    <p className="mt-1 mb-5 text-xs text-gray-500 dark:text-gray-400">
                        Enter your email and we will send a link to choose a new one.
                    </p>

                    <form onSubmit={submit}>
                        <InputLabel htmlFor="email" value="Email" />

                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="mt-1 block w-full"
                            autoComplete="username"
                            isFocused
                            onChange={(event) => setData('email', event.target.value)}
                        />

                        <InputError message={errors.email} className="mt-2" />

                        <div className="mt-5 flex items-center justify-between">
                            <Link
                                href={route('login')}
                                className="text-xs font-medium text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                Back to sign in
                            </Link>

                            <PrimaryButton
                                disabled={processing || !data.email.trim()}
                            >
                                Email reset link
                            </PrimaryButton>
                        </div>
                    </form>
                </>
            )}
        </GuestLayout>
    );
}
