import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['elara-logo.png', 'favicon-32x32.png', 'favicon-16x16.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'Elara Marketplace (Beta)',
        short_name: 'Elara Beta',
        description: 'O seu marketplace de confiança em Angola',
        theme_color: '#9333ea',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        id: '/',
        icons: [
          {
            src: '/favicon-32x32.png',
            sizes: '32x32',
            type: 'image/png'
          },
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/apple-touch-icon.png',
            sizes: '180x180',
            type: 'image/png'
          },
          {
            src: '/elara-logo.png',
            sizes: '1024x1024',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  build: {
    chunkSizeWarningLimit: 1000,
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
});
