import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteCompression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [react(),viteCompression()],
  resolve: {
    dedupe: ['react', 'react-dom']
  },
  build: {
    target: 'esnext',
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
})
