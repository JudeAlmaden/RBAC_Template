import React, { useMemo } from 'react';

/**
 * Generates a consistent HSL background color from a string.
 */
function stringToHue(str = '') {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash) % 360;
}

function getInitials(name = '') {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Avatar component — shows colored initials.
 *
 * @param {string} name   - Full name to derive initials + color from.
 * @param {string} size   - Tailwind size class, e.g. 'w-8 h-8' (default).
 * @param {string} className - Extra classes.
 */
export default function Avatar({ name = '', size = 'w-8 h-8', className = '' }) {
    const hue = useMemo(() => stringToHue(name), [name]);
    const initials = useMemo(() => getInitials(name), [name]);

    const style = {
        backgroundColor: `hsl(${hue}, 55%, 48%)`,
        color: '#fff',
    };

    return (
        <div
            className={`${size} rounded-full flex items-center justify-center font-bold text-[11px] select-none flex-shrink-0 ${className}`}
            style={style}
            title={name}
            aria-label={name}
        >
            {initials}
        </div>
    );
}
