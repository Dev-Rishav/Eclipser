import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react({
      fastRefresh: true,
      jsxRuntime: 'automatic'
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes('react') || 
            id.includes('react-dom') || 
            id.includes('react-router') || 
            id.includes('framer-motion') || 
            id.includes('react-icons') || 
            id.includes('@heroicons') ||
            id.includes('react-redux') ||
            id.includes('@reduxjs')
          ) {
            return 'react-vendor';
          }

          if (id.includes('socket.io')) return 'socket-vendor';
          if (id.includes('axios')) return 'http-vendor';
          if (id.includes('prismjs') || id.includes('react-syntax-highlighter')) return 'highlight-vendor';
          if (id.includes('lottie-react') || id.includes('lottie-web') || id.includes('gsap')) return 'animation-vendor';
          if (id.includes('react-hot-toast') || id.includes('react-toastify')) return 'toast-vendor';
          if (id.includes('lodash') || id.includes('date-fns') || id.includes('moment')) return 'utils-vendor';

          if (id.includes('node_modules/')) return 'vendor';
        }
      }
    },
    chunkSizeWarningLimit: 400,
    target: 'esnext',
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn']
      }
    }
  },
  resolve: {
    dedupe: ['react', 'react-dom']
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
    ]
  },
  server: {
    preTransformRequests: false
  }
});
