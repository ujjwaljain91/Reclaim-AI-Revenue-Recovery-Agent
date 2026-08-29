import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#4F46E5', // Primary brand
          600: '#4338CA',
          700: '#3730A3',
          800: '#312E81',
          900: '#1E1B4B',
        },
        success: {
          50: '#F0FDF4',
          500: '#16A34A',
          600: '#15803D',
        },
        warning: {
          50: '#FFFBEB',
          500: '#D97706',
          600: '#B45309',
        },
        danger: {
          50: '#FEF2F2',
          500: '#DC2626',
          600: '#B91C1C',
        },
        info: {
          50: '#EFF6FF',
          500: '#2563EB',
          600: '#1D4ED8',
        },
        neutral: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
      },
      borderRadius: {
        'sm': '4px',
        'md': '6px',
        'DEFAULT': '8px',
        'lg': '12px',
        'xl': '16px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px rgba(15, 23, 42, 0.04), 0 1px 2px rgba(15, 23, 42, 0.02)',
        'card-hover': '0 4px 12px rgba(15, 23, 42, 0.06)',
        'modal': '0 8px 24px rgba(15, 23, 42, 0.10)',
        'subtle': '0 2px 8px rgba(15, 23, 42, 0.05)',
      },
    },
  },
  plugins: [],
};
export default config;
