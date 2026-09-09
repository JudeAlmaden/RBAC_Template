import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

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
                    DEFAULT: '#5B5FC7',
                    50: '#F5F5FC',
                    100: '#EBEBFA',
                    200: '#D5D6F5',
                    300: '#B5B7ED',
                    400: '#8A8DE2',
                    500: '#5B5FC7',
                    600: '#484CB8',
                    700: '#3A3D9E',
                    800: '#2E307F',
                    900: '#242666',
                    950: '#14153D',
                    accent: '#147BD1',
                    dark: '#0D0D12',
                    surface: '#1C1C20',
                    'surface-raised': '#28282C',
                    border: '#343438',
                },
            },
            boxShadow: {
                'gumloop-sm': 'rgba(0, 0, 0, 0.08) 0px 1px 3px 0px, rgba(0, 0, 0, 0.05) 0px 1px 2px -1px',
                'gumloop-card': '0px 1px 2px rgba(0, 0, 0, 0.04), 0px 4px 8px -2px rgba(0, 0, 0, 0.02)',
                'gumloop-btn': 'rgba(0, 0, 0, 0.016) 0px 1px 1px -0.5px, rgba(0, 0, 0, 0.01) 0px 6px 6px -3px',
            },
            borderRadius: {
                'gumloop': '8px',
            },
        },
    },

    plugins: [forms],
};
