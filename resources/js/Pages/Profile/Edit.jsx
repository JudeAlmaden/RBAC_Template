import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import { SlidersHorizontal } from 'lucide-react';

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h1 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                        Profile Settings
                    </h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Manage your personal account credentials and security
                    </p>
                </div>
            }
        >
            <Head title="Profile Settings" />

            <div className="space-y-6 max-w-4xl">
                <div className="bg-white dark:bg-[#15151A] p-6 sm:p-8 rounded-xl border border-[#E8E8EC] dark:border-[#26262D] shadow-gumloop-card">
                    <UpdateProfileInformationForm
                        mustVerifyEmail={mustVerifyEmail}
                        status={status}
                        className="max-w-xl"
                    />
                </div>

                <div className="bg-white dark:bg-[#15151A] p-6 sm:p-8 rounded-xl border border-[#E8E8EC] dark:border-[#26262D] shadow-gumloop-card">
                    <UpdatePasswordForm className="max-w-xl" />
                </div>

                <div className="bg-white dark:bg-[#15151A] p-6 sm:p-8 rounded-xl border border-[#E8E8EC] dark:border-[#26262D] shadow-gumloop-card">
                    <DeleteUserForm className="max-w-xl" />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
