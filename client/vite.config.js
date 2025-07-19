import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import viteCompression from 'vite-plugin-compression';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, '.', '');
  
  return {
    base: '/',
    plugins: [
      react(),
      viteCompression({
        algorithm: 'gzip',
        ext: '.gz',
      }),
      viteCompression({
        algorithm: 'brotliCompress',
        ext: '.br',
      }),
    ],
    resolve: {
      dedupe: ['react', 'react-dom']
    },
    build: {
      target: 'esnext',
      sourcemap: mode === 'development',
      minify: mode === 'production' ? 'terser' : false,
      terserOptions: mode === 'production' ? {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.debug'],
        },
        mangle: {
          safari10: true,
        },
      } : {},
      rollupOptions: {
        output: {
          manualChunks: {
            // Core React libraries
            'react-vendor': ['react', 'react-dom'],
            
            // UI and Animation libraries
            'ui-vendor': ['framer-motion', 'gsap'],
            
            // Utility libraries
            'utils-vendor': ['axios', 'date-fns'],
            
            // Redux libraries
            'redux-vendor': ['@reduxjs/toolkit', 'react-redux'],
            
            // Socket and communication
            'socket-vendor': ['socket.io-client'],
            
            // Cloudinary and media
            'media-vendor': ['cloudinary-core', 'cloudinary'],
          },
        },
      },
      chunkSizeWarningLimit: 1000,
    },
    server: {
      host: true,
      port: 5173,
      cors: true,
      proxy: mode === 'development' ? {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
        },
      } : {},
    },
    preview: {
      host: true,
      port: 4173,
    },
    define: {
      // Make environment variables available at build time
      __APP_ENV__: JSON.stringify(env.VITE_ENVIRONMENT),
      __API_URL__: JSON.stringify(env.VITE_API_URL),
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'axios',
        'socket.io-client',
        '@reduxjs/toolkit',
        'react-redux',
      ],
      exclude: [],
    },
    esbuild: {
      drop: mode === 'production' ? ['console', 'debugger'] : [],
    },
  }
})
