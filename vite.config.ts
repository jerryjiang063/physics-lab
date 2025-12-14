import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// 使用更稳妥的构建配置，减少 esbuild 压力，提高稳定性
export default defineConfig({
  plugins: [
    react({
      // 使用更简单的 React 插件配置
      jsxRuntime: 'automatic',
    }),
  ],
  build: {
    // 增加 chunk 大小警告限制
    chunkSizeWarningLimit: 2000,
    // 禁用 CSS 代码分割，减少处理复杂度
    cssCodeSplit: false,
    // 禁用 CSS 压缩，减少 esbuild 内存压力
    cssMinify: false,
    // 禁用 source maps 以减少内存使用
    sourcemap: false,
    // 使用 terser 而不是 esbuild 进行压缩，更稳定但稍慢
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false, // 保留 console，减少处理
        drop_debugger: true,
      },
      format: {
        comments: false,
      },
    },
    // CommonJS 选项 - 简化处理
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        // 简化 chunk 分割，减少处理复杂度
        manualChunks: (id: string) => {
          // 只分割大型依赖
          if (id && id.indexOf('node_modules') !== -1) {
            if (id.indexOf('recharts') !== -1) {
              return 'chart-vendor';
            }
            if (id.indexOf('react') !== -1 || id.indexOf('react-dom') !== -1 || id.indexOf('react-router') !== -1) {
              return 'react-vendor';
            }
          }
        },
      },
    },
  },
  // CSS 处理 - 最简配置
  css: {
    postcss: {
      map: false,
    },
    devSourcemap: false,
  },
  // 简化 esbuild 配置，减少转译压力
  // 让 TypeScript 编译器处理类型检查和转译
  esbuild: {
    // 只处理 JSX，其他由 TypeScript 处理
    jsx: 'automatic',
    // 不进行额外的转换
    target: 'es2020',
  },
  // 依赖预构建 - 简化配置，不强制预构建
  optimizeDeps: {
    force: false,
  },
})
