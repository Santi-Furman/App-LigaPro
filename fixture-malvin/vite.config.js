import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Fixture Sportivo Malvin',
        short_name: 'Malvin Fixture',
        description: 'Fixture y posiciones de Sportivo Malvin — Serie 4, Clausura 2026',
        theme_color: '#0e3b2e',
        background_color: '#f6f4ee',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: 'LogoSportivo.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'LogoSportivo.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'LogoSportivo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
})