/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#6366f1',
                    50:  '#eef2ff',
                    100: '#e0e7ff',
                    200: '#c7d2fe',
                    400: '#818cf8',
                    500: '#6366f1',
                    600: '#4f46e5',
                    700: '#4338ca',
                    foreground: '#ffffff',
                },
                secondary: {
                    DEFAULT: '#d946ef',
                    50:  '#fdf4ff',
                    100: '#fae8ff',
                    400: '#e879f9',
                    500: '#d946ef',
                    600: '#c026d3',
                    foreground: '#ffffff',
                },
                accent: {
                    teal: '#2dd4bf',
                    violet: '#7c3aed',
                    rose: '#f43f5e',
                    amber: '#f59e0b',
                },
                dark:    '#0f172a',
                darker:  '#060b16',
                light:   '#f0f4ff',
                surface: {
                    light: '#ffffff',
                    dark:  '#1e293b',
                },
            },
            fontFamily: {
                sans: ["'Plus Jakarta Sans'", 'Inter', 'sans-serif'],
                mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
            },
            backgroundImage: {
                'gradient-brand': 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #d946ef 100%)',
                'gradient-teal':  'linear-gradient(135deg, #2dd4bf 0%, #6366f1 100%)',
                'gradient-card':  'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.6))',
            },
            boxShadow: {
                'glow-primary': '0 0 20px rgba(99, 102, 241, 0.4)',
                'glow-secondary': '0 0 20px rgba(217, 70, 239, 0.4)',
                'card-hover': '0 20px 60px -10px rgba(99, 102, 241, 0.2)',
                'float': '0 8px 30px rgba(0,0,0,0.12)',
            },
            animation: {
                'breathe':      'breathe 19s infinite ease-in-out',
                'float':        'float 6s ease-in-out infinite',
                'blob':         'blob 7s infinite',
                'spin-slow':    'spin 8s linear infinite',
                'pulse-soft':   'pulse 3s ease-in-out infinite',
                'bounce-soft':  'bounce-soft 2s ease-in-out infinite',
                'gradient':     'gradient-shift 4s ease infinite',
                'glow':         'pulse-glow 3s ease-in-out infinite',
            },
            keyframes: {
                breathe: {
                    '0%, 100%': { transform: 'scale(1)' },
                    '21%':      { transform: 'scale(1.5)' },
                    '58%':      { transform: 'scale(1.5)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%':      { transform: 'translateY(-10px)' },
                },
                blob: {
                    '0%':   { transform: 'translate(0px, 0px) scale(1)' },
                    '33%':  { transform: 'translate(30px, -50px) scale(1.1)' },
                    '66%':  { transform: 'translate(-20px, 20px) scale(0.9)' },
                    '100%': { transform: 'translate(0px, 0px) scale(1)' },
                },
                'bounce-soft': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%':      { transform: 'translateY(-6px)' },
                },
                'gradient-shift': {
                    '0%, 100%': { backgroundPosition: '0% 50%' },
                    '50%':      { backgroundPosition: '100% 50%' },
                },
                'pulse-glow': {
                    '0%, 100%': { boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)' },
                    '50%':      { boxShadow: '0 0 50px rgba(99, 102, 241, 0.6), 0 0 100px rgba(217, 70, 239, 0.2)' },
                },
            },
        },
    },
    plugins: [],
}
