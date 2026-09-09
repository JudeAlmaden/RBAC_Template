import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Shield, UserCheck, User, Sparkles } from 'lucide-react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    const quickFill = (email, password) => {
        setData({
            email,
            password,
            remember: false,
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            {/* Header info */}
            <div className="mb-6 text-center">
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Welcome Back</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Sign in with your provisioned account credentials</p>
            </div>

            {status && (
                <div className="mb-4 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    {status}
                </div>
            )}

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="email" value="Email" />

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

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Password" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-4 block">
                    <label className="flex items-center">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData('remember', e.target.checked)
                            }
                        />
                        <span className="ms-2 text-sm text-gray-600 dark:text-gray-400">
                            Remember me
                        </span>
                    </label>
                </div>

                <div className="mt-6 flex items-center justify-end">
                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:text-gray-400 dark:hover:text-gray-100 dark:focus:ring-offset-gray-800"
                        >
                            Forgot password?
                        </Link>
                    )}

                    <PrimaryButton className="ms-4" disabled={processing}>
                        Log in
                    </PrimaryButton>
                </div>
            </form>

            {/* Quick Login Test helper for RBAC testing */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Quick Test Accounts</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                    <button
                        type="button"
                        onClick={() => quickFill('superadmin@example.com', 'password')}
                        className="p-2 text-left rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 hover:border-indigo-400 transition group"
                    >
                        <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-700 dark:text-indigo-400">
                            <Shield className="w-3 h-3" />
                            <span>Super Admin</span>
                        </div>
                        <div className="text-[10px] text-gray-500 dark:text-gray-400 truncate mt-0.5">superadmin</div>
                    </button>

                    <button
                        type="button"
                        onClick={() => quickFill('admin@example.com', 'password')}
                        className="p-2 text-left rounded-lg bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 hover:border-purple-400 transition group"
                    >
                        <div className="flex items-center gap-1 text-[11px] font-bold text-purple-700 dark:text-purple-400">
                            <UserCheck className="w-3 h-3" />
                            <span>Admin</span>
                        </div>
                        <div className="text-[10px] text-gray-500 dark:text-gray-400 truncate mt-0.5">admin</div>
                    </button>

                    <button
                        type="button"
                        onClick={() => quickFill('user@example.com', 'password')}
                        className="p-2 text-left rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-slate-400 transition group"
                    >
                        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            <User className="w-3 h-3" />
                            <span>User</span>
                        </div>
                        <div className="text-[10px] text-gray-500 dark:text-gray-400 truncate mt-0.5">user</div>
                    </button>
                </div>
            </div>
        </GuestLayout>
    );
}
