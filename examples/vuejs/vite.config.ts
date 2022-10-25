import { fileURLToPath, URL } from 'node:url'
import wasm from "vite-plugin-wasm";

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), wasm()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  optimizeDeps: {
    exclude: [
      "cosmian_findex",
      "cosmian_cover_crypt",
    ]
  },
  server: {
    fs: {
      // Allow serving files from one level up to the project root
      allow: ['../../..']
    }
  }
})
