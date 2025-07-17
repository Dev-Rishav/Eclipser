import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Ensure React refresh works properly
      fastRefresh: true,
      // Include JSX runtime
      jsxRuntime: 'automatic'
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Critical: Keep React ecosystem together to avoid circular dependencies
          if (id.includes('react') || id.includes('react-dom') || id.includes('react/') || id.includes('react-dom/')) {
            return 'react-vendor';
          }
          
          // React Router - separate but ensure it has access to React
          if (id.includes('react-router')) {
            return 'router-vendor';
          }
          
          // Redux state management - keep together
          if (id.includes('redux') || id.includes('@reduxjs') || id.includes('react-redux')) {
            return 'state-vendor';
          }
          
          // Framer Motion - large animation library
          if (id.includes('framer-motion')) {
            return 'motion-vendor';
          }
          
          // UI and Icons
          if (id.includes('react-icons') || id.includes('@heroicons')) {
            return 'icons-vendor';
          }
          
          // Code highlighting
          if (id.includes('prismjs') || id.includes('react-syntax-highlighter')) {
            return 'highlight-vendor';
          }
          
          // HTTP utilities
          if (id.includes('axios')) {
            return 'http-vendor';
          }
          
          // Socket.io for real-time features
          if (id.includes('socket.io')) {
            return 'socket-vendor';
          }
          
          // Toast notifications
          if (id.includes('react-hot-toast') || id.includes('react-toastify')) {
            return 'toast-vendor';
          }
          
          // Large utility libraries
          if (id.includes('lodash') || id.includes('date-fns') || id.includes('moment')) {
            return 'utils-vendor';
          }
          
          // Animation libraries (excluding framer-motion which is handled above)
          if (id.includes('lottie-react') || id.includes('lottie-web') || id.includes('gsap')) {
            return 'animation-vendor';
          }
          
          // All other node_modules - group them more conservatively
          if (id.includes('node_modules/')) {
            return 'vendor';
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
  resolve: {
    dedupe: ['react', 'react-dom'] // Ensure only one version of React
  },
  optimizeDeps: {
    include: [
      'react', 
      'react-dom',
      'react-dom/client',
      'react/jsx-runtime',
      'react-router-dom',
      'react-redux',
      'framer-motion'
    ],
    exclude: ['lottie-web']
  },
  // Mobile-first performance optimizations
  server: {
    preTransformRequests: false // Reduce initial server load
  }
})
