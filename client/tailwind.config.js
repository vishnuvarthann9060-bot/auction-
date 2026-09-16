/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ipl: {
          dark: '#0a0f1d',
          card: '#111827',
          gold: '#f59e0b',
          accent: '#3b82f6',
          danger: '#ef4444',
          success: '#10b981'
        }
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
