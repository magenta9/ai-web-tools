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
          DEFAULT: '#5B9BF6',
          hover: '#4A8AE5',
          light: '#E8F0FD',
          dark: '#7AB5FA',
          darkHover: '#8BC5FB',
          darkLight: '#1E3A5F',
        },
        // Semantic colors
        background: {
          light: '#FAFBFC',
          dark: '#1A1F2E',
        },
        surface: {
          light: '#FFFFFF',
          dark: '#242B3D',
          hover: {
            light: '#F5F6F8',
            dark: '#2D3549',
          },
        },
        text: {
          primary: {
            light: '#334155',
            dark: '#D1D5DB',
          },
          secondary: {
            light: '#64748B',
            dark: '#9CA3AF',
          },
          muted: {
            light: '#94A3B8',
            dark: '#6B7280',
          },
        },
        border: {
          light: '#E8EAED',
          dark: '#374151',
          hover: {
            light: '#DCE0E5',
            dark: '#4B5563',
          },
        },
        // Status colors
        success: '#22C55E',
        warning: '#F59E0B',
        error: '#EF4444',
      },
      boxShadow: {
        'sm': '0 1px 3px rgba(0, 0, 0, 0.06)',
        'md': '0 4px 16px rgba(0, 0, 0, 0.10)',
        'lg': '0 8px 32px rgba(0, 0, 0, 0.14)',
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
