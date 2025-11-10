import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'ac09498d5780.ngrok-free.app',
      '*.ngrok-free.app',
      '*.ngrok.io',
      '*.ngrok-free.*.app'
    ],
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
        ws: true,
      }
    }
  }
})
