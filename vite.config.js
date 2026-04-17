import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/ws': {
        target: 'http://localhost:8765',
        ws: true,
      },
      '/kv-store': {
        target: 'http://localhost:8765',
      },
      '/cluster': {
        target: 'http://localhost:8765',
      },
      '/health': {
        target: 'http://localhost:8765',
      },
    },
  },
})
