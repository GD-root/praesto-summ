/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  /* caminhos relativos: o app funciona em https://usuario.github.io/praesto-summ/ ou em qualquer outra pasta */
  base: "./",
  build: { target: "es2020" },
  plugins: [
    VitePWA({
      /* o manifest e os ícones ficam em public/, iguais aos da versão anterior */
      manifest: false,
      injectRegister: false,
      registerType: "autoUpdate",
      filename: "sw.js",
      workbox: {
        globPatterns: ["**/*.{html,js,css,png,webmanifest,json}"],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        navigateFallback: "index.html",
        runtimeCaching: [
          {
            /* as letras do Google Fonts ficam guardadas depois da primeira abertura com internet */
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/,
            handler: "CacheFirst",
            options: {
              cacheName: "fontes",
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  test: {
    include: ["tests/**/*.test.ts"],
  },
});
