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
        stardust: 'rgba(255,255,255,0.8)'
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif']
      },
      backdropBlur: {
        lg: '16px'
      }
    },
  },
  plugins: [],
}

