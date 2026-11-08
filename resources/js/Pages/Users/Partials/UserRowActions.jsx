import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link } from '@inertiajs/react';
import {
    Eye,
    Edit2,
    Trash2,
    ArrowRightLeft,
    Award,
    ShieldMinus,
    MoreHorizontal,
    UserCheck,
    UserX,
} from 'lucide-react';

export default function UserRowActions({
    user,
    onEdit,
    onDelete,
    onPromote,
    onTransfer,
    onDemote,
    onToggleStatus,
}) {
    const [open, setOpen] = useState(false);
    const [menuStyle, setMenuStyle] = useState({});
    const btnRef = useRef(null);

    // Update position and open/close
    const handleToggle = (e) => {
        e.stopPropagation();
        if (!open && btnRef.current) {
            const rect = btnRef.current.getBoundingClientRect();
            const menuWidth = 208; // w-52
            const left = Math.max(8, rect.right - menuWidth);
            const spaceBelow = window.innerHeight - rect.bottom;
            const openUpward = spaceBelow < 240;

            if (openUpward) {
                setMenuStyle({
                    position: 'fixed',
                    bottom: `${window.innerHeight - rect.top + 6}px`,
                    left: `${left}px`,
                    width: `${menuWidth}px`,
                    zIndex: 99999,
                });
            } else {
                setMenuStyle({
                    position: 'fixed',
                    top: `${rect.bottom + 6}px`,
                    left: `${left}px`,
                    width: `${menuWidth}px`,
                    zIndex: 99999,
                });
            }
            setOpen(true);
        } else {
            setOpen(false);
        }
    };

    // Close on outside click, window scroll or resize
    useEffect(() => {
        if (!open) return;

        function handleScrollOrResize() {
            setOpen(false);
        }
        function handleMouseDown(e) {
            if (btnRef.current && btnRef.current.contains(e.target)) return;
            const menuEl = document.getElementById(`user-menu-portal-${user.id}`);
            if (menuEl && menuEl.contains(e.target)) return;
            setOpen(false);
        }
        function handleKeyDown(e) {
            if (e.key === 'Escape') setOpen(false);
        }

        window.addEventListener('scroll', handleScrollOrResize, true);
        window.addEventListener('resize', handleScrollOrResize);
        document.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('scroll', handleScrollOrResize, true);
            window.removeEventListener('resize', handleScrollOrResize);
            document.removeEventListener('mousedown', handleMouseDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [open, user.id]);

    const act = (fn) => {
        setOpen(false);
        if (fn) fn();
    };

    const hasAny =
        user.can.update ||
        user.can.delete ||
        user.can.toggleStatus ||
        user.can.promoteSuperAdmin ||
        user.can.transferSuperAdmin ||
        user.can.demoteSuperAdmin;

    if (!hasAny) return null;

    const portalMenu = open && typeof document !== 'undefined' && createPortal(
        <div
            id={`user-menu-portal-${user.id}`}
            style={menuStyle}
            className="bg-canvas-raised border border-line rounded-xl shadow-2xl overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-75"
        >
            {/* View Profile */}
            <Link
                href={route('users.show', user.id)}
                onClick={() => setOpen(false)}
                className="w-full flex items-center gap-3 px-4 py-2 text-xs text-body-muted hover:text-body-main hover:bg-canvas-hover transition text-left"
            >
                <Eye className="w-3.5 h-3.5 text-body-subtle" />
                View Profile & Audit
            </Link>

            {/* Edit */}
            {user.can.update && (
                <button
                    onClick={() => act(onEdit)}
                    className="w-full flex items-center gap-3 px-4 py-2 text-xs text-body-muted hover:text-body-main hover:bg-canvas-hover transition text-left"
                >
                    <Edit2 className="w-3.5 h-3.5 text-body-subtle" />
                    Edit account
                </button>
            )}

            {/* Activate / Deactivate Account */}
            {user.can.toggleStatus && (
                <button
                    onClick={() => act(onToggleStatus)}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-xs transition text-left ${
                        user.is_active
                            ? 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30'
                            : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                    }`}
                >
                    {user.is_active ? (
                        <>
                            <UserX className="w-3.5 h-3.5" />
                            Deactivate account
                        </>
                    ) : (
                        <>
                            <UserCheck className="w-3.5 h-3.5" />
                            Activate account
                        </>
                    )}
                </button>
            )}

            {/* Promote to Super Admin */}
            {user.can.promoteSuperAdmin && (
                <button
                    onClick={() => act(onPromote)}
                    className="w-full flex items-center gap-3 px-4 py-2 text-xs text-brand hover:bg-brand/10 transition text-left"
                >
                    <Award className="w-3.5 h-3.5" />
                    Promote to Super Admin
                </button>
            )}

            {/* Transfer Privileges */}
            {user.can.transferSuperAdmin && (
                <button
                    onClick={() => act(onTransfer)}
                    className="w-full flex items-center gap-3 px-4 py-2 text-xs text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition text-left"
                >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    Transfer privileges
                </button>
            )}

            {/* Demote */}
            {user.can.demoteSuperAdmin && (
                <button
                    onClick={() => act(onDemote)}
                    className="w-full flex items-center gap-3 px-4 py-2 text-xs text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition text-left"
                >
                    <ShieldMinus className="w-3.5 h-3.5" />
                    Demote to Admin
                </button>
            )}

            {/* Remove Account */}
            {user.can.delete && (
                <>
                    <div className="border-t border-line my-1" />
                    <button
                        onClick={() => act(onDelete)}
                        className="w-full flex items-center gap-3 px-4 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition text-left"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remove account
                    </button>
                </>
            )}
        </div>,
        document.body
    );

    return (
        <div className="relative inline-block text-left">
            <button
                ref={btnRef}
                onClick={handleToggle}
                className={`p-1.5 rounded-lg transition ${
                    open
                        ? 'bg-canvas-hover text-body-main'
                        : 'text-body-subtle hover:text-body-main hover:bg-canvas-hover'
                }`}
                title="Actions"
                aria-expanded={open}
            >
                <MoreHorizontal className="w-4 h-4" />
            </button>

            {portalMenu}
        </div>
    );
}
