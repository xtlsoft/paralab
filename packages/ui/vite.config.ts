/// <reference types="vitest" />

import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import vue from '@vitejs/plugin-vue'

// When running in production mode, the backend is served by the same server, and we don't need to proxy
// When running in dev, we need to proxy the backend to something like localhost:3000
const proxy_config: any = {};

if (process.env['PROXY_BIZSERVER_ADDR']) {
  console.log(`Proxying /api to ${process.env['PROXY_BIZSERVER_ADDR']}`);
  proxy_config['/api'] = {
    target: process.env['PROXY_BIZSERVER_ADDR'],
    changeOrigin: true,
    secure: false
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    nodePolyfills() // Or we will encounter an error when importing jsonwebtoken
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    proxy: proxy_config
  },
  test: {
    globals: true,
    environment: 'jsdom'
  }
})
