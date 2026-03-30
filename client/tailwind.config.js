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
                    DEFAULT: '#6366f1', // Indigo 500
                    foreground: '#ffffff',
                },
                secondary: {
                    DEFAULT: '#d946ef', // Fuchsia 500
                    foreground: '#ffffff',
                },
                dark: '#0f172a', // Slate 900
                light: '#f8fafc', // Slate 50
                surface: {
                    light: '#ffffff',
                    dark: '#1e293b', // Slate 800
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            animation: {
                'breathe': 'breathe 19s infinite ease-in-out',
                'float': 'float 6s ease-in-out infinite',
                'blob': 'blob 7s infinite',
            },
            keyframes: {
                breathe: {
                    '0%, 100%': { transform: 'scale(1)' },
                    '21%': { transform: 'scale(1.5)' },
                    '58%': { transform: 'scale(1.5)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                blob: {
                    '0%': { transform: 'translate(0px, 0px) scale(1)' },
                    '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
                    '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
                    '100%': { transform: 'translate(0px, 0px) scale(1)' },
                }
            }
        },
    },
    plugins: [],
}
