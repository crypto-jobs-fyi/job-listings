import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte()],
  base: '', // Use relative paths for assets
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: [
        './/index.html',
        './/crypto-jobs.html',
        './/crypto-new-jobs.html',
        './/crypto-companies.html',
        './/ai-jobs.html',
        './/ai-new-jobs.html',
        './/ai-companies.html',
        './/fin-jobs.html',
        './/fin-new-jobs.html',
        './/fin-companies.html',
        './/favorites.html',
        './/login.html',
        './/account.html',
        './/admin.html',
      ],
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
})
