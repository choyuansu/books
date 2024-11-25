import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools(), VitePWA({
    registerType: 'autoUpdate', includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
    manifest: {
      name: 'Books',
      short_name: 'Books',
      description: 'Books',
      icons: [
        {
          src: 'android-chrome-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: 'android-chrome-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    }
  })],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
