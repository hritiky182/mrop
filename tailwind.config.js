/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#0A131F',
          900: '#0F1E30',
          800: '#14283F',
          700: '#1B3554',
          600: '#23446B',
          500: '#2E5584',
          100: '#E2E8F0',
          50: '#F0F4F8'
        },
        copper: {
          50: '#FDF7F2',
          100: '#FAEDE4',
          200: '#F4D8C5',
          300: '#EEBFA2',
          400: '#DA9362',
          500: '#C47B45', // Primary accent
          600: '#B06834',
          700: '#915125',
          800: '#733F1D',
          900: '#5A3117',
        },
        industrial: {
          bg: '#F4F6F8',
          surface: '#FFFFFF',
          slate: '#475569',
          border: '#E2E8F0',
          muted: '#64748B',
          subtle: '#94A3B8',
        },
        status: {
          positive: '#16805D',
          'positive-bg': '#EAF6F1',
          warning: '#D99A22',
          'warning-bg': '#FEF7EA',
          critical: '#C74646',
          'critical-bg': '#FDF2F2',
          info: '#3578B8',
          'info-bg': '#EFF6FC',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.03)',
        'card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}
