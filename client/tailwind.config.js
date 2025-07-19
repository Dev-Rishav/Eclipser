/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Space Black Variations (like reference image)
        'space-void': '#0A0B0E',          // Deepest background
        'space-dark': '#151921',          // Card backgrounds
        'space-darker': '#1A1F2B',        // Elevated cards
        'space-gray': '#252B3A',          // Borders/dividers
        'space-light': '#353C4F',         // Hover states
        
        // Text Colors
        'space-text': '#E4E6EA',          // Primary text
        'space-muted': '#9CA3AF',         // Secondary text
        'space-dim': '#6B7280',           // Disabled text
        
        // Accent Colors (from reference)
        'stellar-blue': '#7B68EE',        // Primary blue accent
        'stellar-purple': '#A855F7',      // Purple accent  
        'stellar-orange': '#FF4500',      // Orange accent
        'stellar-green': '#16A34A',       // Success/optional green (darker for light mode visibility)
        
        // Light Mode (minimal changes)
        'eclipse-light': '#FAFAFA',
        'eclipse-surface': '#FFFFFF',
        'eclipse-border': '#E5E5E5',
        'eclipse-text-light': '#1F2937',
        'eclipse-muted-light': '#6B7280',
      },
      boxShadow: {
        'stellar-blue-glow': '0 0 20px rgba(123, 104, 238, 0.5), 0 0 40px rgba(123, 104, 238, 0.2)',
        'stellar-blue-glow-lg': '0 0 30px rgba(123, 104, 238, 0.7), 0 0 60px rgba(123, 104, 238, 0.3)',
        'stellar-purple-glow': '0 0 20px rgba(168, 85, 247, 0.5), 0 0 40px rgba(168, 85, 247, 0.2)',
        'stellar-orange-glow': '0 0 20px rgba(255, 69, 0, 0.5), 0 0 40px rgba(255, 69, 0, 0.2)',
        'stellar-green-glow': '0 0 20px rgba(34, 255, 34, 0.5), 0 0 40px rgba(34, 255, 34, 0.2)',
        'space-card': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
        'space-elevated': '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
      },
      animation: {
        'stellar-pulse': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'edge-glow': 'edgeGlow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        edgeGlow: {
          '0%': { 
            borderColor: 'rgba(123, 104, 238, 0.5)',
            boxShadow: '0 0 20px rgba(123, 104, 238, 0.3)'
          },
          '100%': { 
            borderColor: 'rgba(123, 104, 238, 0.8)',
            boxShadow: '0 0 30px rgba(123, 104, 238, 0.5)'
          }
        }
      }
    },
  },
  plugins: [],
}

