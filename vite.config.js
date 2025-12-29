import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['react/jsx-runtime', 'react/jsx-dev-runtime']
  },
  server: {
    port: 3001,
    proxy: {
      '/api': 'http://localhost:3000'
    }
  }
})
