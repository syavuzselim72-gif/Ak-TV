import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: './src',
  build: {
    outDir: '../dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html'),
        login: resolve(__dirname, 'src/login.html'),
        register: resolve(__dirname, 'src/register.html'),
        profile: resolve(__dirname, 'src/profile.html'),
        upload: resolve(__dirname, 'src/upload.html'),
        admin: resolve(__dirname, 'src/admin.html')
      }
    }
  },
  server: {
    port: 5173,
    open: '/index.html'
  },
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      './utils': resolve(__dirname, 'src/utils'),
    }
  }
});