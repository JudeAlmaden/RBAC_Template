import { useEffect, useState } from 'react';

/**
 * Applies the colour mode to the document root.
 *
 * The same preference is applied before first paint by the inline script in
 * resources/views/app.blade.php, so this only has to keep it in sync.
 */
export function applyTheme(isDark) {
    const root = document.documentElement;

    root.classList.toggle('dark', isDark);
    root.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

/**
 * Resolves the colour mode the document is currently painted with: the stored
 * preference when there is one, otherwise the operating system setting.
 */
export function initialDarkMode() {
    if (typeof window === 'undefined') {
        return false;
    }

    const stored = localStorage.getItem('theme');

    if (stored) {
        return stored === 'dark';
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * Tracks the colour mode for a layout and writes it back to the document.
 *
 * @returns {[boolean, (isDark: boolean) => void]}
 */
export default function useTheme() {
    const [dark, setDark] = useState(initialDarkMode);

    useEffect(() => {
        applyTheme(dark);
    }, [dark]);

    return [dark, setDark];
}
