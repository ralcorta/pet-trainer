import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

const base = '/pet-trainer/'

export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      // Registered manually in src/pwa.ts so we can poll for updates
      injectRegister: false,
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Pet Trainer',
        short_name: 'PetTrainer',
        description: 'Seguimiento de clases para entrenador de perros',
        theme_color: '#4a7c59',
        background_color: '#e8efe6',
        display: 'standalone',
        lang: 'es',
        start_url: base,
        scope: base,
        icons: [
          {
            src: 'pwa-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        navigateFallback: `${base}index.html`,
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
      },
    }),
  ],
})
