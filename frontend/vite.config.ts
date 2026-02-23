import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// 是否重写 /api 前缀
// true：后端未使用 /api 前缀，需要将 /api 路径去掉后再转发
// false：后端使用 /api 前缀，保持原样转发
const shouldRewriteApi = true

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '^/api/': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (p) => {
          return shouldRewriteApi ? p.replace(/^\/api/, '') : p
        }
      }
    }
  }
})
