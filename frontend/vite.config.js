import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': 'http://localhost:8765',
      '/recordings': 'http://localhost:8765',
      '/progress': 'http://localhost:8765',
      '/health': 'http://localhost:8765',
    },
  },
})
