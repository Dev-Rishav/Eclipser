/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Backgrounds
        'cyber-black': '#08080C',
        'cyber-dark': '#1B1B20',
        
        // Text/Primary Elements
        'cyber-text': '#B0B0B0',
        
        // Accent Colors
        'cyber-blue': '#00F0FF',    // Electric Blue - Primary Interaction
        'cyber-purple': '#7B68EE',  // Medium Slate Blue - Secondary Interaction
        'cyber-orange': '#FF4500',  // Orange-Red - Alert/Warning
        'cyber-green': '#22FF22',   // Bright Green - Code Highlight/Optional
      },
      boxShadow: {
        'cyber-blue-glow': '0 0 10px #00F0FF, 0 0 20px #00F0FF40',
        'cyber-purple-glow': '0 0 10px #7B68EE, 0 0 20px #7B68EE40',
        'cyber-orange-glow': '0 0 10px #FF4500, 0 0 20px #FF450040',
        'cyber-green-glow': '0 0 10px #22FF22, 0 0 20px #22FF2240',
      },
      animation: {
        'cyber-pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}

