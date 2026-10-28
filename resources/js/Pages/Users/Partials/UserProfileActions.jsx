import React, { useState, useRef, useEffect } from 'react';
import {
    MoreHorizontal,
    ChevronDown,
    ChevronRight,
    Edit2,
    UserCheck,
    UserX,
    Award,
    ArrowRightLeft,
    ShieldMinus,
    Trash2,
} from 'lucide-react';

export default function UserProfileActions({
    userCan,
    profileUser,
    onEdit,
    onToggleStatus,
    onPromote,
    onTransfer,
    onDemote,
    onDelete,
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    // Close on outside click or Escape key
    useEffect(() => {
        if (!open) return;
        const handleKey = (e) => {
            if (e.key === 'Escape') setOpen(false);
        };
        const handleClick = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('keydown', handleKey);
        document.addEventListener('mousedown', handleClick);
        return () => {
            document.removeEventListener('keydown', handleKey);
            document.removeEventListener('mousedown', handleClick);
        };
    }, [open]);

    const run = (fn) => {
        setOpen(false);
        if (fn) fn();
    };

    const hasPrivilege = userCan.promoteSuperAdmin || userCan.transferSuperAdmin || userCan.demoteSuperAdmin;
    const hasDanger = userCan.delete || userCan.toggleStatus;

    return (
        <div ref={ref} className="relative">
            <button
                id="profile-actions-btn"
                type="button"
                onClick={() => setOpen((o) => !o)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition select-none shadow-xs ${
                    open
                        ? 'bg-[#5B5FC7] text-white border-[#5B5FC7] shadow-sm'
                        : 'bg-white dark:bg-[#1E1E24] text-gray-700 dark:text-[#F8F9FD] border-[#E8E8EC] dark:border-[#343438] hover:bg-gray-50 dark:hover:bg-[#28282C]'
                }`}
            >
                <MoreHorizontal className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                <span>Actions</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180 text-white' : 'text-gray-400'}`} />
            </button>

            {open && (
                <div className="absolute right-0 top-[calc(100%+6px)] z-50 w-64 rounded-xl border border-[#E8E8EC] dark:border-[#343438] bg-white dark:bg-[#1C1C20] shadow-xl shadow-black/10 dark:shadow-black/40 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                    {/* Account section */}
                    <div className="p-1.5">
                        <p className="px-2.5 pt-1 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                            Account
                        </p>

                        {userCan.update && (
                            <button
                                type="button"
                                onClick={() => run(onEdit)}
                                className="group w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#252535] transition"
                            >
                                <span className="w-7 h-7 rounded-md bg-gray-100 dark:bg-[#252530] flex items-center justify-center text-gray-500 dark:text-gray-400 group-hover:bg-[#5B5FC7]/10 group-hover:text-[#5B5FC7] transition shrink-0">
                                    <Edit2 className="w-3.5 h-3.5" />
                                </span>
                                <span className="flex-1 text-left">
                                    <span className="block font-semibold">Edit Account</span>
                                    <span className="block text-[10px] text-gray-400 mt-0.5">Name, email, password &amp; roles</span>
                                </span>
                                <ChevronRight className="w-3 h-3 text-gray-300 dark:text-gray-600 group-hover:text-[#5B5FC7] transition" />
                            </button>
                        )}

                        {userCan.toggleStatus && (
                            <button
                                type="button"
                                onClick={() => run(onToggleStatus)}
                                className="group w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#252535] transition"
                            >
                                <span className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 transition ${
                                    profileUser.is_active
                                        ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                                        : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                                }`}>
                                    {profileUser.is_active
                                        ? <UserX className="w-3.5 h-3.5" />
                                        : <UserCheck className="w-3.5 h-3.5" />}
                                </span>
                                <span className="flex-1 text-left">
                                    <span className="block font-semibold">{profileUser.is_active ? 'Deactivate' : 'Activate'} Account</span>
                                    <span className="block text-[10px] text-gray-400 mt-0.5">
                                        {profileUser.is_active ? 'Revoke sign-in access' : 'Restore sign-in access'}
                                    </span>
                                </span>
                                <ChevronRight className="w-3 h-3 text-gray-300 dark:text-gray-600 group-hover:text-gray-500 transition" />
                            </button>
                        )}
                    </div>

                    {/* Privilege section */}
                    {hasPrivilege && (
                        <>
                            <div className="mx-1.5 border-t border-[#E8E8EC] dark:border-[#26262D]" />
                            <div className="p-1.5">
                                <p className="px-2.5 pt-1 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                                    Privileges
                                </p>

                                {userCan.promoteSuperAdmin && (
                                    <button
                                        type="button"
                                        onClick={() => run(onPromote)}
                                        className="group w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs text-gray-700 dark:text-gray-200 hover:bg-[#5B5FC7]/5 dark:hover:bg-[#5B5FC7]/10 transition"
                                    >
                                        <span className="w-7 h-7 rounded-md bg-[#5B5FC7]/10 dark:bg-[#5B5FC7]/20 flex items-center justify-center text-[#5B5FC7] dark:text-[#8A8DE2] shrink-0">
                                            <Award className="w-3.5 h-3.5" />
                                        </span>
                                        <span className="flex-1 text-left">
                                            <span className="block font-semibold text-[#5B5FC7] dark:text-[#8A8DE2]">Promote to Super Admin</span>
                                            <span className="block text-[10px] text-gray-400 mt-0.5">Grant highest authority</span>
                                        </span>
                                        <ChevronRight className="w-3 h-3 text-[#5B5FC7]/40 group-hover:text-[#5B5FC7] transition" />
                                    </button>
                                )}

                                {userCan.transferSuperAdmin && (
                                    <button
                                        type="button"
                                        onClick={() => run(onTransfer)}
                                        className="group w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs text-gray-700 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-purple-950/20 transition"
                                    >
                                        <span className="w-7 h-7 rounded-md bg-purple-100 dark:bg-purple-950/40 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                                            <ArrowRightLeft className="w-3.5 h-3.5" />
                                        </span>
                                        <span className="flex-1 text-left">
                                            <span className="block font-semibold text-purple-700 dark:text-purple-400">Transfer Privileges</span>
                                            <span className="block text-[10px] text-gray-400 mt-0.5">Move primary Super Admin role</span>
                                        </span>
                                        <ChevronRight className="w-3 h-3 text-purple-300/60 group-hover:text-purple-500 transition" />
                                    </button>
                                )}

                                {userCan.demoteSuperAdmin && (
                                    <button
                                        type="button"
                                        onClick={() => run(onDemote)}
                                        className="group w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs text-gray-700 dark:text-gray-200 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition"
                                    >
                                        <span className="w-7 h-7 rounded-md bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                                            <ShieldMinus className="w-3.5 h-3.5" />
                                        </span>
                                        <span className="flex-1 text-left">
                                            <span className="block font-semibold text-amber-700 dark:text-amber-400">Demote to Admin</span>
                                            <span className="block text-[10px] text-gray-400 mt-0.5">Remove Super Admin authority</span>
                                        </span>
                                        <ChevronRight className="w-3 h-3 text-amber-300/60 group-hover:text-amber-500 transition" />
                                    </button>
                                )}
                            </div>
                        </>
                    )}

                    {/* Danger section */}
                    {hasDanger && (
                        <>
                            <div className="mx-1.5 border-t border-[#E8E8EC] dark:border-[#26262D]" />
                            <div className="p-1.5">
                                <button
                                    type="button"
                                    onClick={() => run(onDelete)}
                                    className="group w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs hover:bg-red-50 dark:hover:bg-red-950/20 transition"
                                >
                                    <span className="w-7 h-7 rounded-md bg-red-50 dark:bg-red-950/40 flex items-center justify-center text-red-500 dark:text-red-400 shrink-0">
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </span>
                                    <span className="flex-1 text-left">
                                        <span className="block font-semibold text-red-600 dark:text-red-400">Remove Account</span>
                                        <span className="block text-[10px] text-gray-400 mt-0.5">Delete or permanently deactivate</span>
                                    </span>
                                    <ChevronRight className="w-3 h-3 text-red-300/60 group-hover:text-red-500 transition" />
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
