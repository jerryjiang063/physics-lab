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
    // 临时开启 source maps 以定位 TDZ 错误
    sourcemap: true,
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
        // 修复：确保 React 核心库和 jsx-runtime 在一起，避免运行时 React undefined
        // 不要将 react/jsx-runtime 单独分离，它必须和 React 核心库在一起
        manualChunks: (id: string) => {
          if (!id || id.indexOf('node_modules') === -1) {
            return;
          }
          
          // React 核心库（包括 jsx-runtime）必须在一起，不能分离
          // 这样可以确保 React 的 __SECRET_INTERNALS 正确初始化
          if (id.indexOf('react-dom') !== -1) {
            return 'react-dom';
          }
          // React 核心库（包括所有 react 相关，但不包括 react-dom）
          // 注意：不要单独分离 jsx-runtime，它必须和 react 核心在一起
          if (id.indexOf('react') !== -1 && id.indexOf('react-dom') === -1) {
            return 'react-vendor';
          }
          // React Router 必须在 React 之后
          if (id.indexOf('react-router') !== -1) {
            return 'react-router';
          }
          // Recharts 必须在 React 之后
          if (id.indexOf('recharts') !== -1) {
            return 'chart-vendor';
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
