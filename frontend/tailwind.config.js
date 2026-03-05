/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class', // Enable class-based dark mode
    theme: {
        extend: {
            colors: {
                app: 'hsl(var(--bg-app))',
                surface: 'hsl(var(--surface))',
                border: 'hsl(var(--border))',

                text: {
                    main: 'hsl(var(--text-main))',
                    muted: 'hsl(var(--text-muted))',
                },

                brand: {
                    primary: 'hsl(var(--brand-primary))',
                    primaryLight: 'hsl(var(--brand-primary-light))',
                    primaryDark: 'hsl(var(--brand-primary-dark))',
                    secondary: 'hsl(var(--brand-secondary))',
                    secondaryLight: 'hsl(var(--brand-secondary-light))',
                    secondaryDark: 'hsl(var(--brand-secondary-dark))',
                },

                semantic: {
                    success: 'hsl(var(--semantic-success))',
                    warning: 'hsl(var(--semantic-warning))',
                    error: 'hsl(var(--semantic-error))',
                    info: 'hsl(var(--semantic-info))',
                }
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
            }
        },
    },
    plugins: [],
}