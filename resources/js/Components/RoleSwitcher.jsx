import React, { useState, useRef, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Check, ChevronDown, Layers, Eye, Shield } from 'lucide-react';

export default function RoleSwitcher({ activeRole, switchableRoles = [], isPreviewing = false, userRoles = [], isSuperAdmin = false }) {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!switchableRoles || switchableRoles.length <= 1) {
        return null;
    }

    const formatRoleText = (role) => {
        if (!role) return 'Full Access View';
        if (role === 'super_admin') return 'Super Admin';
        if (role === 'admin') return 'Admin';
        if (role === 'learner') return 'Learner';
        if (role === 'user') return 'Learner';
        return role.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    };

    const handleSelect = (roleName) => {
        setOpen(false);
        router.post(route('switch-role'), { role: roleName }, { preserveScroll: true });
    };

    const currentLabel = activeRole ? formatRoleText(activeRole) : 'Full Access View';

    return (
        <div className="relative pt-2.5 px-3 pb-0.5" ref={dropdownRef}>
            <div className="flex items-center justify-between text-[0.625rem] text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wider mb-1 px-1">
                <span>Active Role View</span>
                {isPreviewing && (
                    <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold">
                        <Eye className="w-3 h-3" /> Preview
                    </span>
                )}
            </div>

            <button
                type="button"
                onClick={() => setOpen(!open)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-medium transition select-none ${
                    isPreviewing
                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-700 dark:text-amber-300 hover:bg-amber-500/15'
                        : activeRole
                        ? 'bg-accent/10 border-accent/30 text-accent-light hover:bg-accent/15'
                        : 'bg-surface dark:bg-raised border-line text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 shadow-2xs'
                }`}
            >
                <div className="flex items-center gap-2 truncate">
                    {activeRole ? (
                        <Shield className="w-3.5 h-3.5 shrink-0" />
                    ) : (
                        <Layers className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    )}
                    <span className="truncate">{currentLabel}</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div className="absolute left-3 right-3 bottom-full mb-1.5 bg-surface dark:bg-raised border border-line rounded-xl shadow-xl z-50 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100 max-h-64 overflow-y-auto">
                    {/* Unified option */}
                    <button
                        type="button"
                        onClick={() => handleSelect(null)}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs transition text-left ${
                            !activeRole
                                ? 'bg-gray-100 dark:bg-raised font-semibold text-gray-900 dark:text-white'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-raised dark:hover:bg-raised'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <Layers className="w-3.5 h-3.5 text-gray-400" />
                            <span>Full Access View</span>
                        </div>
                        {!activeRole && <Check className="w-3.5 h-3.5 text-accent" />}
                    </button>

                    <div className="border-t border-line my-1" />

                    {/* Roles options */}
                    {switchableRoles.map((r) => {
                        const isSelected = activeRole === r;
                        const isSimulated = isSuperAdmin && !userRoles.includes(r);

                        return (
                            <button
                                key={r}
                                type="button"
                                onClick={() => handleSelect(r)}
                                className={`w-full flex items-center justify-between px-3 py-2 text-xs transition text-left ${
                                    isSelected
                                        ? 'bg-gray-100 dark:bg-raised font-semibold text-gray-900 dark:text-white'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-raised dark:hover:bg-raised'
                                }`}
                            >
                                <div className="flex items-center gap-2 truncate">
                                    <span
                                        className={`w-2 h-2 rounded-full shrink-0 ${
                                            r === 'super_admin'
                                                ? 'bg-accent'
                                                : r === 'admin'
                                                ? 'bg-blue-500'
                                                : r === 'learner' || r === 'user'
                                                ? 'bg-accent'
                                                : 'bg-indigo-500'
                                        }`}
                                    />
                                    <span className="truncate">{formatRoleText(r)}</span>
                                    {isSimulated && (
                                        <span className="px-1.5 py-0.2 rounded text-[0.5625rem] font-semibold bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-300/40">
                                            Preview
                                        </span>
                                    )}
                                </div>
                                {isSelected && <Check className="w-3.5 h-3.5 text-accent shrink-0" />}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
