/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['Fira Code', 'SF Mono', 'Consolas', 'monospace'],
      },
      colors: {
        // Primary colors
        primary: {
          DEFAULT: '#2563EB',
          hover: '#1d4ed8',
          light: '#dbeafe',
          dark: '#60A5FA',
          darkHover: '#93C5FD',
          darkLight: '#1E3A5F',
        },
        // Semantic colors
        background: {
          light: '#FFFFFF',
          dark: '#0F172A',
        },
        surface: {
          light: '#FFFFFF',
          dark: '#1E293B',
          hover: {
            light: '#F8FAFC',
            dark: '#334155',
          },
        },
        text: {
          primary: {
            light: '#1E293B',
            dark: '#F1F5F9',
          },
          secondary: {
            light: '#64748B',
            dark: '#94A3B8',
          },
          muted: {
            light: '#94A3B8',
            dark: '#64748B',
          },
        },
        border: {
          light: '#E2E8F0',
          dark: '#334155',
          hover: {
            light: '#CBD5E1',
            dark: '#475569',
          },
        },
        // Status colors
        success: '#22C55E',
        warning: '#F59E0B',
        error: '#EF4444',
      },
      boxShadow: {
        'sm': '0 1px 2px rgba(0, 0, 0, 0.04)',
        'md': '0 4px 12px rgba(0, 0, 0, 0.08)',
        'lg': '0 8px 24px rgba(0, 0, 0, 0.12)',
      },
      borderRadius: {
        'sm': '6px',
        'md': '8px',
        'lg': '12px',
      },
      transitionDuration: {
        'fast': '150ms',
        'normal': '200ms',
      },
    },
  },
  plugins: [],
}
