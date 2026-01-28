import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/tooloo/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React 核心库
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // PDF 相关库
          'pdf-vendor': ['pdf-lib'],
          // Markdown 相关库
          'markdown-vendor': ['marked'],
          // QR Code 相关库
          'qrcode-vendor': ['qrcode'],
          // 图像处理相关库（AI 抠图）会自动分离，因为它太大了
        }
      }
    },
    // 设置 chunk 大小警告限制
    chunkSizeWarningLimit: 1000
  }
})
