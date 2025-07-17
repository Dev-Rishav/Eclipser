import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      external: [
        'highlight.js/lib/languages/dockerfile',
        'refractor/lang/docker.js'
      ],
      output: {
        manualChunks: (id) => {
          // React core - keep small for critical path
          if (id.includes('react') || id.includes('react-dom')) {
            return 'react-core';
          }
          
          // React Router - separate for route-based loading
          if (id.includes('react-router')) {
            return 'router-vendor';
          }
          
          // Framer Motion - large animation library
          if (id.includes('framer-motion')) {
            return 'motion-vendor';
          }
          
          // Lottie animations - separate heavy library
          if (id.includes('lottie-react') || id.includes('lottie-web')) {
            return 'lottie-vendor';
          }
          
          // UI Icons - can be loaded later
          if (id.includes('react-icons') || id.includes('@heroicons')) {
            return 'icons-vendor';
          }
          
          // Redux state management
          if (id.includes('redux') || id.includes('@reduxjs')) {
            return 'state-vendor';
          }
          
          // Code highlighting - heavy and not immediately needed
          if (id.includes('prismjs') || id.includes('highlight.js') || id.includes('react-syntax-highlighter')) {
            return 'highlight-vendor';
          }
          
          // HTTP and date utilities
          if (id.includes('axios')) {
            return 'http-vendor';
          }
          
          if (id.includes('date-fns')) {
            return 'date-vendor';
          }
          
          // Socket.io for real-time features
          if (id.includes('socket.io')) {
            return 'socket-vendor';
          }
          
          // Page components - lazy load these
          if (id.includes('src/pages/')) {
            return 'pages-vendor';
          }
          
          // Heavy UI components
          if (id.includes('src/components/') && (
            id.includes('ChatModal') || 
            id.includes('Contest') || 
            id.includes('PostCard') ||
            id.includes('FeedControlBar') ||
            id.includes('Navbar')
          )) {
            return 'components-vendor';
          }
          
          // Chart libraries (if any)
          if (id.includes('chart') || id.includes('d3') || id.includes('recharts')) {
            return 'charts-vendor';
          }
          
          // Babel and core-js polyfills
          if (id.includes('@babel') || id.includes('core-js')) {
            return 'polyfills-vendor';
          }
          
          // Large utility libraries
          if (id.includes('lodash') || id.includes('ramda') || id.includes('moment')) {
            return 'utils-large-vendor';
          }
          
          // CSS-in-JS libraries
          if (id.includes('styled-components') || id.includes('@emotion') || id.includes('styled-system')) {
            return 'css-vendor';
          }
          
          // Development and testing libraries (should not be in production)
          if (id.includes('prop-types') || id.includes('react-dev-utils')) {
            return 'dev-vendor';
          }
          
          // Form libraries
          if (id.includes('formik') || id.includes('react-hook-form') || id.includes('yup')) {
            return 'forms-vendor';
          }
          
          // Animation and graphics utilities
          if (id.includes('gsap') || id.includes('three') || id.includes('pixi') || id.includes('canvas')) {
            return 'graphics-vendor';
          }
          
          // Remaining smaller node_modules - split by common prefixes
          if (id.includes('node_modules')) {
            // Split by first letter for better distribution
            const match = id.match(/node_modules\/([a-z])/);
            if (match) {
              const firstLetter = match[1];
              if (['a', 'b', 'c'].includes(firstLetter)) return 'vendor-abc';
              if (['d', 'e', 'f'].includes(firstLetter)) return 'vendor-def';
              if (['g', 'h', 'i'].includes(firstLetter)) return 'vendor-ghi';
              if (['j', 'k', 'l'].includes(firstLetter)) return 'vendor-jkl';
              if (['m', 'n', 'o'].includes(firstLetter)) return 'vendor-mno';
              if (['p', 'q', 'r'].includes(firstLetter)) return 'vendor-pqr';
              if (['s', 't', 'u'].includes(firstLetter)) return 'vendor-stu';
              if (['v', 'w', 'x', 'y', 'z'].includes(firstLetter)) return 'vendor-vwxyz';
            }
            return 'vendor-misc';
          }
        }
      }
    },
    chunkSizeWarningLimit: 400, // Lower limit for mobile optimization
    target: 'esnext',
    sourcemap: false, // Disable sourcemaps in production for smaller files
    minify: 'terser', // Use terser for better compression
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn']
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'framer-motion'],
    exclude: ['lottie-web'] // Large library, load on demand
  },
  // Mobile-first performance optimizations
  server: {
    preTransformRequests: false // Reduce initial server load
  }
})
