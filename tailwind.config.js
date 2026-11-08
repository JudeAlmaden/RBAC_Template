import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

function withOpacity(variableName) {
    return ({ opacityValue }) => {
        if (opacityValue !== undefined) {
            return `color-mix(in srgb, var(${variableName}) calc(${opacityValue} * 100%), transparent)`;
        }
        return `var(${variableName})`;
    };
}

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['"Plus Jakarta Sans"', 'Inter', ...defaultTheme.fontFamily.sans],
                mono: ['"JetBrains Mono"', ...defaultTheme.fontFamily.mono],
            },
            colors: {
                brand: {
                    DEFAULT: withOpacity('--brand-primary'),
                    hover: withOpacity('--brand-hover'),
                    accent: withOpacity('--brand-accent'),
                    50: '#F5F5FC',
                    100: '#EBEBFA',
                    200: '#D5D6F5',
                    300: '#B5B7ED',
                    400: withOpacity('--brand-accent'),
                    500: withOpacity('--brand-primary'),
                    600: withOpacity('--brand-hover'),
                    700: '#3A3D9E',
                    800: '#2E307F',
                    900: '#242666',
                    950: '#14153D',
                    dark: withOpacity('--bg-page'),
                    surface: withOpacity('--bg-surface'),
                    'surface-raised': withOpacity('--bg-surface-raised'),
                    border: withOpacity('--border-subtle'),
                },
                canvas: {
                    page: withOpacity('--bg-page'),
                    card: withOpacity('--bg-card'),
                    surface: withOpacity('--bg-surface'),
                    raised: withOpacity('--bg-surface-raised'),
                    hover: withOpacity('--bg-hover'),
                    muted: withOpacity('--bg-muted'),
                },
                line: {
                    DEFAULT: withOpacity('--border-subtle'),
                    subtle: withOpacity('--border-subtle'),
                    strong: withOpacity('--border-strong'),
                },
                body: {
                    main: withOpacity('--text-main'),
                    muted: withOpacity('--text-muted'),
                    subtle: withOpacity('--text-subtle'),
                },
            },
            borderColor: {
                DEFAULT: withOpacity('--border-subtle'),
            },
            ringColor: {
                brand: withOpacity('--brand-primary'),
            },
            boxShadow: {
                'soft': 'rgba(0, 0, 0, 0.08) 0px 1px 3px 0px, rgba(0, 0, 0, 0.05) 0px 1px 2px -1px',
                'card': '0px 1px 2px rgba(0, 0, 0, 0.04), 0px 4px 8px -2px rgba(0, 0, 0, 0.02)',
                'btn': 'rgba(0, 0, 0, 0.016) 0px 1px 1px -0.5px, rgba(0, 0, 0, 0.01) 0px 6px 6px -3px',
            },
            borderRadius: {
                'panel': '8px',
            },
        },
    },

    plugins: [forms],
};
