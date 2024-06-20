import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5000
  },
  preview: {
    port: 5000
  },
  devServer: {
    open: process.platform === 'darwin',
    host: '0.0.0.0',
    port: 5000, // CHANGE YOUR PORT HERE!
    https: false,
    hotOnly: false,
  },
})
