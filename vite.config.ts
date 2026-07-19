import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
   plugins: [
      react(),
      tailwindcss(),
      VitePWA({
         registerType: 'autoUpdate',
         manifest: {
            name: 'Grocery Budget Tracker',
            short_name: 'Grocery Tracker',
            description: 'Track grocery spending against your budget.',
            theme_color: '#15803d',   // gr4een-700, matches your app theme
            background_color: '#ffffff',
            display: 'standalone',
            start_url: '/',
            icons: [
               { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
               { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
               { src: 'icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
            ],
         },
      }),
   ],
   optimizeDeps: {
      // transformers.js ships its own WASM/WebGPU worker files; pre-bundling
      // it with esbuild causes issues, so it's excluded from dep optimization.
      exclude: ['@huggingface/transformers'],
   },
})