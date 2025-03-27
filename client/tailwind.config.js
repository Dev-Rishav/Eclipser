/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cosmic: '#0B0D17',
        stellar: '#1A1C2E',
        nebula: '#4F46E5',
        supernova: '#FF6B35',
        corona: '#FFD700',
        stardust: 'rgba(255,255,255,0.8)',
        'galaxy-purple': '#1a1a4a'
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif']
      },
      backdropBlur: {
        lg: '16px'
      },
      animation: {
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        float: 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-fast': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-input': 'glow 3s ease-in-out infinite'
      },
      keyframes: {
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(79, 70, 229, 0.1)' },
          '50%': { boxShadow: '0 0 15px rgba(79, 70, 229, 0.3)' }
        }
      },
      boxShadow: {
        glow: '0 0 10px rgba(79, 70, 229, 0.1)',
        'glow-intense': '0 0 20px rgba(79, 70, 229, 0.4)',
        galaxy: '0 0 30px rgba(79, 70, 229, 0.1)'
      },
    },
  },
  plugins: [],
}

