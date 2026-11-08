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
        if (!role) return 'Unified (All Roles)';
        if (role === 'super_admin') return 'Super Admin';
        if (role === 'admin') return 'Admin';
        if (role === 'user') return 'Basic User';
        return role.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    };

    const handleSelect = (roleName) => {
        setOpen(false);
        router.post(route('switch-role'), { role: roleName }, { preserveScroll: true });
    };

    const currentLabel = activeRole ? formatRoleText(activeRole) : 'All Roles';

    return (
        <div className="relative pt-2.5 px-3 pb-0.5" ref={dropdownRef}>
            <div className="flex items-center justify-between text-[10px] text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wider mb-1 px-1">
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
                        ? 'bg-brand/10 border-brand/30 text-brand hover:bg-brand/15'
                        : 'bg-canvas-card border-line text-body-muted hover:text-body-main hover:border-line-strong shadow-2xs'
                }`}
            >
                <div className="flex items-center gap-2 truncate">
                    {activeRole ? (
                        <Shield className="w-3.5 h-3.5 shrink-0" />
                    ) : (
                        <Layers className="w-3.5 h-3.5 text-body-subtle shrink-0" />
                    )}
                    <span className="truncate">{currentLabel}</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-body-subtle transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div className="absolute left-3 right-3 bottom-full mb-1.5 bg-canvas-raised border border-line rounded-xl shadow-xl z-50 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100 max-h-64 overflow-y-auto">
                    {/* Unified option */}
                    <button
                        type="button"
                        onClick={() => handleSelect(null)}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs transition text-left ${
                            !activeRole
                                ? 'bg-canvas-hover font-semibold text-body-main'
                                : 'text-body-muted hover:bg-canvas-hover hover:text-body-main'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <Layers className="w-3.5 h-3.5 text-body-subtle" />
                            <span>Unified (All Roles)</span>
                        </div>
                        {!activeRole && <Check className="w-3.5 h-3.5 text-brand" />}
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
                                        ? 'bg-canvas-hover font-semibold text-body-main'
                                        : 'text-body-muted hover:bg-canvas-hover hover:text-body-main'
                                }`}
                            >
                                <div className="flex items-center gap-2 truncate">
                                    <span
                                        className={`w-2 h-2 rounded-full shrink-0 ${
                                            r === 'super_admin'
                                                ? 'bg-brand'
                                                : r === 'admin'
                                                ? 'bg-blue-500'
                                                : r === 'user'
                                                ? 'bg-gray-400'
                                                : 'bg-indigo-500'
                                        }`}
                                    />
                                    <span className="truncate">{formatRoleText(r)}</span>
                                    {isSimulated && (
                                        <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-300/40">
                                            Preview
                                        </span>
                                    )}
                                </div>
                                {isSelected && <Check className="w-3.5 h-3.5 text-brand shrink-0" />}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
