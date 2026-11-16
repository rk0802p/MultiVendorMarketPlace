/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Monochromatic Hue Scale (50..950)
        mono: {
          50: 'rgb(var(--mono-50) / <alpha-value>)',
          100: 'rgb(var(--mono-100) / <alpha-value>)',
          200: 'rgb(var(--mono-200) / <alpha-value>)',
          300: 'rgb(var(--mono-300) / <alpha-value>)',
          400: 'rgb(var(--mono-400) / <alpha-value>)',
          500: 'rgb(var(--mono-500) / <alpha-value>)',
          600: 'rgb(var(--mono-600) / <alpha-value>)',
          700: 'rgb(var(--mono-700) / <alpha-value>)',
          800: 'rgb(var(--mono-800) / <alpha-value>)',
          900: 'rgb(var(--mono-900) / <alpha-value>)',
          950: 'rgb(var(--mono-950) / <alpha-value>)',
        },
        // Semantic Tokens
        bg: 'rgb(var(--bg) / <alpha-value>)',
        surface: {
          DEFAULT: 'rgb(var(--surface) / <alpha-value>)',
          2: 'rgb(var(--surface-2) / <alpha-value>)',
          3: 'rgb(var(--surface-3) / <alpha-value>)',
        },
        border: {
          DEFAULT: 'rgb(var(--border) / <alpha-value>)',
          subtle: 'rgb(var(--border) / <alpha-value>)',
          line: 'rgb(var(--border) / <alpha-value>)',
          strong: 'rgb(var(--border-strong) / <alpha-value>)',
        },
        line: 'rgb(var(--border) / <alpha-value>)',
        main: 'rgb(var(--text) / <alpha-value>)',
        muted: 'rgb(var(--text-muted) / <alpha-value>)',
        inverse: 'rgb(var(--text-inverse) / <alpha-value>)',
        primary: {
          DEFAULT: 'rgb(var(--primary) / <alpha-value>)',
          hover: 'rgb(var(--primary-hover) / <alpha-value>)',
          active: 'rgb(var(--primary-active) / <alpha-value>)',
          subtle: 'rgb(var(--primary-subtle) / <alpha-value>)',
        },
        ring: 'rgb(var(--ring) / <alpha-value>)',
        overlay: 'rgb(var(--overlay) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        control: '0.5rem',
        card: '0.875rem',
        modal: '1rem',
        pill: '9999px',
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgb(var(--mono-950) / 0.05)',
        sm: '0 1px 3px 0 rgb(var(--mono-950) / 0.07), 0 1px 2px -1px rgb(var(--mono-950) / 0.07)',
        md: '0 4px 6px -1px rgb(var(--mono-950) / 0.08), 0 2px 4px -2px rgb(var(--mono-950) / 0.08)',
        lg: '0 10px 15px -3px rgb(var(--mono-950) / 0.08), 0 4px 6px -4px rgb(var(--mono-950) / 0.08)',
        xl: '0 20px 25px -5px rgb(var(--mono-950) / 0.08), 0 8px 10px -6px rgb(var(--mono-950) / 0.08)',
      },
      transitionDuration: {
        DEFAULT: '180ms',
      },
    },
  },
  plugins: [],
}
