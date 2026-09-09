/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        portal: {
          bg: "#04050A",
          card: "#090D1A",
          cardHover: "#0E1528",
          border: "#1E293B",
          borderActive: "#3B82F6",
          blue: "#3B82F6",
          cyan: "#22D3EE",
          neonGreen: "#10B981",
          gold: "#F59E0B",
          silver: "#94A3B8",
          bronze: "#D97706",
          danger: "#EF4444"
        }
      },
      fontFamily: {
        heading: ["'Space Grotesk'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
        sans: ["Inter", "sans-serif"]
      },
      boxShadow: {
        'glow-blue': '0 0 25px -5px rgba(59, 130, 246, 0.5)',
        'glow-cyan': '0 0 25px -5px rgba(34, 211, 238, 0.5)',
        'glow-green': '0 0 25px -5px rgba(16, 185, 129, 0.5)'
      },
      animation: {
        'pulse-glow': 'pulseGlow 2.5s infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.02)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        }
      }
    },
  },
  plugins: [],
}
