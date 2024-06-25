import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  const API_URL = `${env.VITE_API_URL ?? 'http://127.0.0.1:3000'}`;
  const PORT = `${env.VITE_PORT ?? '5000'}`;

  process.env.VITE_API_URL = API_URL;

  return {
    plugins: [
      vue(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    server: {
      proxy: {
        '/api': {
          target: API_URL,
          changeOrigin: true,
          secure: false,
          ws: true,
          rewrite: (p) => p.replace(/^\/login/, ''),
        },
        '/images': {
          target: API_URL,
          changeOrigin: true,
          secure: false,
          ws: true,
        }
      },
      host: '0.0.0.0',
      port: PORT
    },
    preview: {
      port: PORT
    },
    devServer: {
      proxy: {
        '/api': {
          target: API_URL,
          changeOrigin: true,
          secure: false,
          ws: true,
          rewrite: (p) => p.replace(/^\/login/, ''),
        }
      },
      open: process.platform === 'darwin',
      host: '0.0.0.0',
      port: PORT, // CHANGE YOUR PORT HERE!
      https: false,
      hotOnly: false,
    },
    env: {
      BACKEND_DEFAULT: 'http://127.0.0.1:3000' 
    },
    build: {
      outDir: '../backend/public',
    }
  };
});

