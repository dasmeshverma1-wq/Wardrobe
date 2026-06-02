import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'node:path';

/** Subpath when hosted on GitHub Pages (`/<repo-name>/`). */
const pagesBase =
  process.env.GITHUB_PAGES === 'true'
    ? `/${process.env.GITHUB_REPOSITORY_NAME || 'Wardrobe'}/`
    : '/';

export default defineConfig({
  base: pagesBase,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      workbox: {
        // The @imgly bundle is large and we lazy-load it; avoid pre-caching it.
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        globPatterns: ['**/*.{js,css,html,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.origin === 'https://api.open-meteo.com',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'forecast-cache',
              expiration: { maxEntries: 16, maxAgeSeconds: 60 * 60 * 6 },
              networkTimeoutSeconds: 5,
            },
          },
        ],
      },
      manifest: {
        name: 'Myntra Digital Wardrobe',
        short_name: 'Wardrobe',
        description: 'Digitise your closet, style outfits, and plan your week.',
        theme_color: '#FF2A66',
        background_color: '#FFFFFF',
        display: 'standalone',
        start_url: pagesBase,
        icons: [
          {
            src: '/favicon.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: '/favicon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
});
