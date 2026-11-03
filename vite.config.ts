import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

/** 로컬 dev/preview·배포(vercel.json 등) 모두 `/juso-api` → juso.go.kr */
const jusoProxy = {
  '/juso-api': {
    target: 'https://www.juso.go.kr',
    changeOrigin: true,
    rewrite: (pathname: string) => pathname.replace(/^\/juso-api/, ''),
  },
}

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
    proxy: jusoProxy,
  },
  preview: {
    host: true,
    port: 4173,
    proxy: jusoProxy,
  },
})
