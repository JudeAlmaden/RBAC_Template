import React, { createContext, useContext, useEffect, useState } from 'react';

export const THEME_PRESETS = [
    { id: 'default', label: 'Default (Indigo/Purple)', primaryColor: '#5B5FC7' },
    { id: 'emerald', label: 'Emerald Green', primaryColor: '#059669' },
    { id: 'ocean', label: 'Ocean Blue', primaryColor: '#2563EB' },
    { id: 'sunset', label: 'Sunset Rose', primaryColor: '#E11D48' },
];

const ThemeContext = createContext({
    dark: false,
    setDark: () => {},
    toggleDark: () => {},
    theme: 'default',
    setTheme: () => {},
    presets: THEME_PRESETS,
});

export function ThemeProvider({ children }) {
    // Mode: dark or light
    const [dark, setDarkState] = useState(() => {
        if (typeof window === 'undefined') return false;
        const stored = localStorage.getItem('theme_mode') || localStorage.getItem('theme');
        if (stored) return stored === 'dark';
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    // Theme preset
    const [theme, setThemeState] = useState(() => {
        if (typeof window === 'undefined') return 'default';
        return localStorage.getItem('theme_preset') || 'default';
    });

    // Sync mode (dark class) to DOM and localStorage
    useEffect(() => {
        const root = document.documentElement;
        if (dark) {
            root.classList.add('dark');
            localStorage.setItem('theme_mode', 'dark');
            localStorage.setItem('theme', 'dark'); // legacy compatibility
        } else {
            root.classList.remove('dark');
            localStorage.setItem('theme_mode', 'light');
            localStorage.setItem('theme', 'light');
        }
    }, [dark]);

    // Sync theme preset (data-theme) to DOM and localStorage
    useEffect(() => {
        const root = document.documentElement;
        if (theme && theme !== 'default') {
            root.setAttribute('data-theme', theme);
        } else {
            root.removeAttribute('data-theme');
        }
        localStorage.setItem('theme_preset', theme);
    }, [theme]);

    const setDark = (value) => {
        setDarkState(typeof value === 'function' ? value(dark) : value);
    };

    const toggleDark = () => {
        setDarkState((prev) => !prev);
    };

    const setTheme = (newTheme) => {
        setThemeState(newTheme);
    };

    return (
        <ThemeContext.Provider
            value={{
                dark,
                setDark,
                toggleDark,
                theme,
                setTheme,
                presets: THEME_PRESETS,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

