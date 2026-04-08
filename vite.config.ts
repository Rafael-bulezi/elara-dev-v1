import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['elara-logo.png'],
      manifest: {
        name: 'Elara Marketplace (Beta)',
        short_name: 'Elara Beta',
        description: 'O seu marketplace de confiança em Angola',
        theme_color: '#9333ea',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: '/elara-logo.png',
            sizes: 'any',
            type: 'image/png'
          },
          {
            src: '/elara-logo.png',
            sizes: '1024x1024',
            type: 'image/png',
            purpose: 'maskable'
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
