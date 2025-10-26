import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from "@tailwindcss/vite"
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  root: 'src/frontend',
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        secure: false,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/frontend'),
    },
  },
  build: {
    outDir: path.resolve(__dirname, 'dist/frontend'),
    emptyOutDir: true,
  },
})