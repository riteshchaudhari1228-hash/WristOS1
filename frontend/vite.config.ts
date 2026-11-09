import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
    // Local dev only: proxy /api → Python FastAPI backend
    // In production (Vercel), VITE_API_URL env var points directly to Render backend URL
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      }
    }
  },
  build: {
    // Output to dist/ — Vercel reads this automatically
    outDir: 'dist',
    // Increase chunk warning limit (our bundle is intentionally large due to Recharts + Lucide)
    chunkSizeWarningLimit: 1000,
  }
})
