import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { MoreHorizontal } from 'lucide-react';

export default function ActionDropdown({
    align = 'right',
    trigger = null,
    children,
    widthClass = 'w-44',
}) {
    const [open, setOpen] = useState(false);
    const [menuStyle, setMenuStyle] = useState({});
    const btnRef = useRef(null);
    const menuRef = useRef(null);

    const handleToggle = (e) => {
        e.stopPropagation();
        if (!open && btnRef.current) {
            const rect = btnRef.current.getBoundingClientRect();
            const menuWidth = parseInt(widthClass.replace(/\D/g, '') || '44', 10) * 4; // approximate px from tailwind
            const actualWidth = menuWidth || 176;

            let left = align === 'right' ? rect.right - actualWidth : rect.left;
            left = Math.max(8, Math.min(left, window.innerWidth - actualWidth - 8));

            const spaceBelow = window.innerHeight - rect.bottom;
            const openUpward = spaceBelow < 200;

            if (openUpward) {
                setMenuStyle({
                    position: 'fixed',
                    bottom: `${window.innerHeight - rect.top + 4}px`,
                    left: `${left}px`,
                    width: `${actualWidth}px`,
                    zIndex: 99999,
                });
            } else {
                setMenuStyle({
                    position: 'fixed',
                    top: `${rect.bottom + 4}px`,
                    left: `${left}px`,
                    width: `${actualWidth}px`,
                    zIndex: 99999,
                });
            }
            setOpen(true);
        } else {
            setOpen(false);
        }
    };

    useEffect(() => {
        if (!open) return;
        const handleOutsideClick = (e) => {
            if (
                btnRef.current &&
                !btnRef.current.contains(e.target) &&
                menuRef.current &&
                !menuRef.current.contains(e.target)
            ) {
                setOpen(false);
            }
        };

        const handleScroll = () => setOpen(false);

        document.addEventListener('click', handleOutsideClick);
        window.addEventListener('scroll', handleScroll, true);
        window.addEventListener('resize', handleScroll);

        return () => {
            document.removeEventListener('click', handleOutsideClick);
            window.removeEventListener('scroll', handleScroll, true);
            window.removeEventListener('resize', handleScroll);
        };
    }, [open]);

    return (
        <div className="relative inline-flex items-center">
            {trigger ? (
                <div ref={btnRef} onClick={handleToggle}>
                    {trigger}
                </div>
            ) : (
                <button
                    ref={btnRef}
                    type="button"
                    onClick={handleToggle}
                    className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-raised dark:hover:bg-raised transition focus:outline-hidden"
                    title="More actions"
                >
                    <MoreHorizontal className="w-4 h-4" />
                </button>
            )}

            {open &&
                createPortal(
                    <div
                        ref={menuRef}
                        style={menuStyle}
                        onClick={() => setOpen(false)}
                        className="rounded-lg bg-surface dark:bg-raised border border-line shadow-lg py-1 text-xs z-50 animate-in fade-in zoom-in-95 duration-100"
                    >
                        {children}
                    </div>,
                    document.body
                )}
        </div>
    );
}

