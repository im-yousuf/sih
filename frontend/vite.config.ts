import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

/**
 * Vite configuration
 *
 * Dev  — the proxy rewrites /api and /ws to localhost:8000 so the browser
 *        never sees a CORS request during local development.
 *
 * Prod — the proxy is irrelevant; axios uses VITE_API_URL and the WebSocket
 *        service uses VITE_WS_URL, both set as Vercel environment variables.
 */
export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  // ── Dev server ────────────────────────────────────────────────────────────
  server: {
    port: 5173,   // Vite default — also matches start.bat and INSTALLATION.md
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://localhost:8000',
        ws: true,
      },
    },
  },

  // ── Production build ──────────────────────────────────────────────────────
  build: {
    outDir: 'dist',
    sourcemap: false,   // disable in prod to keep bundle size down
    rollupOptions: {
      output: {
        // Split large vendor chunks so Vercel CDN can cache them separately
        manualChunks: {
          'react-vendor':  ['react', 'react-dom', 'react-router-dom'],
          'three-vendor':  ['three', '@react-three/fiber', '@react-three/drei'],
          'chart-vendor':  ['recharts'],
          'state-vendor':  ['zustand'],
          'i18n-vendor':   ['i18next', 'react-i18next'],
        },
      },
    },
  },
})
