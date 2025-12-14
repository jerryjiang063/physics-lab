import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Optimize build performance
    cssCodeSplit: true,
    // Reduce memory pressure during build
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'chart-vendor': ['recharts'],
        },
      },
    },
  },
  // Optimize CSS processing
  css: {
    postcss: {
      // Disable source maps in production to reduce memory usage
      map: false,
    },
  },
})

