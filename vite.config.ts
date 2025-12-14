import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 2000,
    // Optimize build performance
    cssCodeSplit: false, // Disable CSS code splitting to reduce processing
    // Reduce memory pressure during build
    commonjsOptions: {
      // Optimize CommonJS handling for large dependencies like recharts
      include: [/node_modules/],
      transformMixedEsModules: true,
      // Require returns default export for CommonJS modules
      requireReturnsDefault: 'auto',
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'chart-vendor': ['recharts'],
        },
      },
    },
    // Disable CSS minification to reduce esbuild memory pressure
    cssMinify: false,
  },
  // Optimize CSS processing
  css: {
    postcss: {
      // Disable source maps in production to reduce memory usage
      map: false,
    },
    // Use simpler CSS processing
    devSourcemap: false,
  },
  // Optimize esbuild options - reduce memory usage during transform
  esbuild: {
    // Reduce memory usage - let rollup handle minification
    legalComments: 'none',
    // Target modern JS to reduce transformation complexity
    target: 'es2020',
  },
  // Optimize dependency pre-bundling
  optimizeDeps: {
    include: ['recharts'],
    esbuildOptions: {
      // Reduce memory pressure during pre-bundling
      target: 'es2020',
    },
  },
})

