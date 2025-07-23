 import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/backend': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        // ✨ REMOVE the rewrite line
        // rewrite: path => path.replace(/^\/backend/, ''), ← DELETE THIS
      },
    },
  },
  plugins: [react()],
})
