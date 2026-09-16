/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Outfit', 'sans-serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        teko: ['Teko', 'sans-serif'],
      },
      colors: {
        dark: {
          bg: '#050505',
          surface: '#121212',
          card: '#161616',
          hover: '#1e1e1e',
          border: '#27272a',
        },
        brand: {
          indigo: '#6366f1',
          violet: '#a855f7',
          glow: 'rgba(99, 102, 241, 0.35)',
        },
        ipl: {
          dark: '#050505',
          card: '#121212',
          gold: '#f59e0b',
          accent: '#6366f1',
          danger: '#ef4444',
          success: '#10b981'
        }
      },
      letterSpacing: {
        tighter: '-0.04em',
        tight: '-0.03em',
        widest: '0.1em',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' }
        },
        gavelDrop: {
          '0%': { transform: 'rotate(-45deg)', transformOrigin: 'bottom left' },
          '70%': { transform: 'rotate(15deg)', transformOrigin: 'bottom left' },
          '100%': { transform: 'rotate(0deg)', transformOrigin: 'bottom left' }
        }
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'gavel': 'gavelDrop 0.4s ease-out'
      }
    },
  },
  plugins: [],
}
