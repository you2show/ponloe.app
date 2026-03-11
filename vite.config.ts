import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const geminiApiKey = process.env.GEMINI_API_KEY || env.GEMINI_API_KEY;
    
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        allowedHosts: true,
        hmr: false, // Disable HMR to prevent "Port 24678 is already in use" errors
      },
      plugins: [
        react(), 
        tailwindcss(),
        VitePWA({
          registerType: 'autoUpdate',
          includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
          manifest: {
            name: 'Ponloe - Quran & Islamic Tools',
            short_name: 'Ponloe',
            description: 'Islamic companion app with Quran, Prayer Times, and more.',
            theme_color: '#059669',
            background_color: '#ffffff',
            display: 'standalone',
            orientation: 'portrait',
            icons: [
              {
                src: 'https://cdn-icons-png.flaticon.com/512/3655/3655580.png',
                sizes: '192x192',
                type: 'image/png'
              },
              {
                src: 'https://cdn-icons-png.flaticon.com/512/3655/3655580.png',
                sizes: '512x512',
                type: 'image/png'
              },
              {
                src: 'https://cdn-icons-png.flaticon.com/512/3655/3655580.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any maskable'
              }
            ]
          },
          workbox: {
            globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
            runtimeCaching: [
              {
                urlPattern: /^\/api\/quran\/.*/i,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'local-quran-cache',
                  expiration: {
                    maxEntries: 500,
                    maxAgeSeconds: 60 * 60 * 24 * 30,
                  },
                  cacheableResponse: {
                    statuses: [0, 200],
                  },
                },
              },
              {
                urlPattern: /^\/api\/qurancdn\/.*/i,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'local-qurancdn-cache',
                  expiration: {
                    maxEntries: 500,
                    maxAgeSeconds: 60 * 60 * 24 * 30,
                  },
                  cacheableResponse: {
                    statuses: [0, 200],
                  },
                },
              },
              {
                urlPattern: /^\/api\/alquran\/.*/i,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'local-alquran-cache',
                  expiration: {
                    maxEntries: 500,
                    maxAgeSeconds: 60 * 60 * 24 * 30,
                  },
                  cacheableResponse: {
                    statuses: [0, 200],
                  },
                },
              },
              {
                urlPattern: /^\/api\/quranenc\/.*/i,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'local-quranenc-cache',
                  expiration: {
                    maxEntries: 200,
                    maxAgeSeconds: 60 * 60 * 24 * 30,
                  },
                  cacheableResponse: {
                    statuses: [0, 200],
                  },
                },
              },
              {
                urlPattern: /^\/api\/pt\/cal.*/i,
                handler: 'NetworkFirst',
                options: {
                  cacheName: 'local-prayer-times-cache',
                  expiration: {
                    maxEntries: 50,
                    maxAgeSeconds: 60 * 60 * 24,
                  },
                  cacheableResponse: {
                    statuses: [0, 200],
                  },
                },
              },
              {
                urlPattern: /^https:\/\/api\.quran\.com\/api\/v4\/.*/i,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'quran-api-cache',
                  expiration: {
                    maxEntries: 500,
                    maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
                  },
                  cacheableResponse: {
                    statuses: [0, 200],
                  },
                },
              },
              {
                urlPattern: /^https:\/\/api\.alquran\.cloud\/v1\/.*/i,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'alquran-api-cache',
                  expiration: {
                    maxEntries: 500,
                    maxAgeSeconds: 60 * 60 * 24 * 30,
                  },
                  cacheableResponse: {
                    statuses: [0, 200],
                  },
                },
              },
              {
                urlPattern: /^https:\/\/api\.aladhan\.com\/v1\/.*/i,
                handler: 'NetworkFirst',
                options: {
                  cacheName: 'prayer-times-cache',
                  expiration: {
                    maxEntries: 50,
                    maxAgeSeconds: 60 * 60 * 24, // 1 day
                  },
                  cacheableResponse: {
                    statuses: [0, 200],
                  },
                },
              },
              {
                urlPattern: /^https:\/\/quranenc\.com\/api\/v1\/.*/i,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'quranenc-api-cache',
                  expiration: {
                    maxEntries: 100,
                    maxAgeSeconds: 60 * 60 * 24 * 30,
                  },
                  cacheableResponse: {
                    statuses: [0, 200],
                  },
                },
              },
              {
                urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'image-cache',
                  expiration: {
                    maxEntries: 100,
                    maxAgeSeconds: 60 * 60 * 24 * 7, // 1 week
                  },
                },
              },
              {
                urlPattern: /\.(?:mp3|wav|ogg)$/,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'audio-cache',
                  expiration: {
                    maxEntries: 50,
                    maxAgeSeconds: 60 * 60 * 24 * 7,
                  },
                },
              },
              {
                urlPattern: /^https:\/\/api\.telegram\.org\/file\/bot.*/i,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'telegram-media-cache',
                  expiration: {
                    maxEntries: 200,
                    maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
                  },
                  cacheableResponse: {
                    statuses: [0, 200],
                  },
                },
              },
              {
                urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/v1\/object\/public\/.*/i,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'supabase-media-cache',
                  expiration: {
                    maxEntries: 200,
                    maxAgeSeconds: 60 * 60 * 24 * 30,
                  },
                  cacheableResponse: {
                    statuses: [0, 200],
                  },
                },
              }
            ]
          }
        })
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(geminiApiKey || ''),
        'process.env.GEMINI_API_KEY': JSON.stringify(geminiApiKey || ''),
        'process.env.APP_URL': JSON.stringify(process.env.APP_URL || env.APP_URL || '')
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
