import React from 'react';
import Avatar from '@/Components/Avatar';
import Pagination from '@/Components/Pagination';
import UserRowActions from './UserRowActions';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function UserTable({
    users,
    meta,
    formatRoleText,
    onEdit,
    onDelete,
    onPromote,
    onTransfer,
    onDemote,
    onToggleStatus,
}) {
    return (
        <div className="bg-white dark:bg-[#15151A] rounded-xl border border-[#E8E8EC] dark:border-[#26262D] shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                    <thead>
                        <tr className="border-b border-[#E8E8EC] dark:border-[#26262D] bg-[#FAFAFC] dark:bg-[#1C1C24] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[10px]">
                            <th className="py-3.5 px-5">User</th>
                            <th className="py-3.5 px-5">Role</th>
                            <th className="py-3.5 px-5">Status</th>
                            <th className="py-3.5 px-5">Created</th>
                            <th className="py-3.5 px-5 text-right"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8E8EC] dark:divide-[#26262D] text-gray-700 dark:text-gray-300">
                        {users.data.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="py-12 text-center text-gray-400">
                                    No user accounts match your search.
                                </td>
                            </tr>
                        ) : (
                            users.data.map((u) => {
                                const isSelf = u.id === meta.currentUserId;
                                return (
                                    <tr
                                        key={u.id}
                                        className="hover:bg-gray-50/60 dark:hover:bg-[#1C1C24]/50 transition"
                                    >
                                        <td className="py-3.5 px-5">
                                            <div className="flex items-center gap-3">
                                                <Avatar name={u.name} size="w-7 h-7" />
                                                <div>
                                                    <div className="font-semibold text-gray-900 dark:text-white">
                                                        {u.name}{' '}
                                                        {isSelf && (
                                                            <span className="text-gray-400 font-normal text-[11px]">
                                                                (You)
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-gray-400 font-mono text-[11px]">
                                                        {u.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="py-3.5 px-5 text-gray-700 dark:text-gray-300 font-medium">
                                            <div className="flex flex-wrap gap-1.5 max-w-xs">
                                                {(() => {
                                                    const rawRoles = (u.roles && u.roles.length > 0) ? u.roles : [u.role || 'user'];
                                                    const filtered = rawRoles.length > 1 ? rawRoles.filter((r) => r !== 'user') : rawRoles;
                                                    const displayList = filtered.length > 0 ? filtered : ['user'];

                                                    return displayList.map((roleName) => (
                                                        <span
                                                            key={roleName}
                                                            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                                                                roleName === 'super_admin'
                                                                    ? 'bg-[#5B5FC7]/10 text-[#5B5FC7] dark:bg-[#5B5FC7]/20 dark:text-[#8A8DE2]'
                                                                    : roleName === 'admin'
                                                                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                                                                    : roleName === 'user'
                                                                    ? 'bg-gray-100 text-gray-700 dark:bg-[#202028] dark:text-gray-300'
                                                                    : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40'
                                                            }`}
                                                        >
                                                            {formatRoleText(roleName)}
                                                        </span>
                                                    ));
                                                })()}
                                            </div>
                                        </td>

                                        <td className="py-3.5 px-5">
                                            {u.is_active ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 dark:bg-[#22222A] text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-[#2C2C38]">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                                                    Deactivated
                                                </span>
                                            )}
                                        </td>

                                        <td className="py-3.5 px-5 text-gray-400 font-mono text-[11px]">
                                            {u.created_at}
                                        </td>

                                        <td className="py-3.5 px-5 text-right">
                                            <UserRowActions
                                                user={u}
                                                onEdit={() => onEdit(u)}
                                                onDelete={() => onDelete(u)}
                                                onPromote={() => onPromote(u)}
                                                onTransfer={() => onTransfer(u)}
                                                onDemote={() => onDemote(u)}
                                                onToggleStatus={() => onToggleStatus(u)}
                                            />
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            <Pagination paginator={users} />
        </div>
    );
}
