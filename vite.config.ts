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
        name: 'Elara Marketplace',
        short_name: 'Elara',
        description: 'O seu marketplace de confiança em Angola',
        theme_color: '#9333ea',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'elara-logo.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'elara-logo.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'elara-logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
});
