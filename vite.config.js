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
        './index.html',
        './crypto-jobs.html',
        './crypto-new-jobs.html',
        './ai-jobs.html',
        './ai-new-jobs.html',
        './ai-favorites.html',
        './ai-companies.html', // Add ai-companies.html to the input array
        './crypto-companies.html', // Add crypto-companies.html to the input array
      ],
      output: {
        // Configure output options for the new page
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
})
