import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: 'rgb(var(--surface) / <alpha-value>)',
        ink: 'rgb(var(--ink) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        brand: 'rgb(var(--brand) / <alpha-value>)',
        brand2: 'rgb(var(--brand-2) / <alpha-value>)'
      },
      boxShadow: {
        soft: '0 20px 80px rgba(15, 23, 42, 0.12)'
      }
    }
  },
  plugins: []
} satisfies Config;
