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
                // Tokyo Neon Palette
                neon: {
                    pink: '#ff00ff',
                    cyan: '#00ffff',
                    purple: '#bc13fe',
                    yellow: '#f9f871',
                },
                dark: {
                    bg: '#0f172a', // Slate 900
                    surface: '#1e293b', // Slate 800
                    border: '#334155', // Slate 700
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
