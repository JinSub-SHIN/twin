import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/juso-api': {
        target: 'https://www.juso.go.kr',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/juso-api/, ''),
      },
    },
  },
})
