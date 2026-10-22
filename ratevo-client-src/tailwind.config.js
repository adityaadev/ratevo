/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Monochrome palette
        bg: '#000000',
        surface: '#0A0A0A',
        'surface-hover': '#111111',
        border: 'rgba(255,255,255,0.10)',
        'border-strong': 'rgba(255,255,255,0.20)',
        text: '#EDEDED',
        'text-muted': '#A1A1A1',
        'text-subtle': '#6B6B6B',
        white: '#FFFFFF',
        // Muted red for errors only
        error: '#EE0000',
        'error-bg': 'rgba(238,0,0,0.10)',
        'error-border': 'rgba(238,0,0,0.30)',
      },
      fontFamily: {
        sans: ['Geist', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['Geist Mono', 'Fira Code', 'monospace'],
        logo: ['var(--font-logo)'],
      },
      fontSize: {
        'body': ['14px', { lineHeight: '1.5', letterSpacing: '0' }],
        'heading-xl': ['32px', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '600' }],
        'heading-lg': ['28px', { lineHeight: '1.15', letterSpacing: '-0.015em', fontWeight: '600' }],
        'heading-md': ['24px', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '600' }],
        'heading-sm': ['20px', { lineHeight: '1.25', letterSpacing: '0', fontWeight: '500' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
      },
      boxShadow: {
        'focus': '0 0 0 2px rgba(255,255,255,0.3)',
        'card': '0 1px 3px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.10)',
      },
      transitionDuration: {
        'fast': '120ms',
        'base': '180ms',
        'slow': '250ms',
      },
      transitionTimingFunction: {
        'ease-out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}