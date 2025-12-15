import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// 简化配置，避免 chunk 分割导致的 TDZ 和初始化顺序问题
export default defineConfig({
  // 确保 base 适配 Netlify 根域名部署
  base: '/',
  plugins: [
    react({
      jsxRuntime: 'automatic',
    }),
  ],
  build: {
    // 使用单文件输出，彻底避免 chunk 分割导致的 TDZ/循环依赖问题
    // 这样可以确保所有模块按正确顺序初始化，不会出现 "Cannot access 'r' before initialization"
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
    // 保留 sourcemap 用于调试（生产环境可以关闭）
    sourcemap: true,
    // 使用 terser 压缩（更稳定）
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false,
        drop_debugger: true,
      },
    },
  },
})
