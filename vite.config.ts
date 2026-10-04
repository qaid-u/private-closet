import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt'],
      manifest: {
        name: 'Private Closet',
        short_name: 'PrivateCloset',
        description: 'Private, offline daily outfit planner from your own wardrobe.',
        theme_color: '#F9F5EE',
        background_color: '#F9F5EE',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'favicon.svg',
            sizes: '192x192 512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
        shortcuts: [
          {
            name: 'Today Outfit',
            short_name: 'Today',
            description: 'Get today’s outfit recommendation',
            url: '/?tab=today',
            icons: [{ src: 'favicon.svg', sizes: '192x192' }],
          },
          {
            name: 'Add Clothing Item',
            short_name: 'Add Item',
            description: 'Photograph or add a new piece to your closet',
            url: '/?tab=closet&action=add',
            icons: [{ src: 'favicon.svg', sizes: '192x192' }],
          },
          {
            name: 'Outfit Studio',
            short_name: 'Outfits',
            description: 'Build and check outfits',
            url: '/?tab=outfits',
            icons: [{ src: 'favicon.svg', sizes: '192x192' }],
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-dexie': ['dexie', 'dexie-react-hooks'],
          'vendor-lucide': ['lucide-react'],
        },
      },
    },
  },
  server: {
    port: 5173,
    host: true,
  },
});
