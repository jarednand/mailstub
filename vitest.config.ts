import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from "@tailwindcss/vite";
import path from 'path';

export default defineConfig({
  test: {
    projects: [
      // Frontend tests
      {
        plugins: [react(), tailwindcss()],
        resolve: {
          alias: {
            '@': path.resolve(__dirname, './src/frontend'),
          },
        },
        test: {
          name: 'frontend',
          globals: true,
          environment: 'jsdom',
          setupFiles: ['./src/frontend/test/setup.ts'],
          css: true,
          include: ['src/frontend/**/*.{test,spec}.{ts,tsx}'],
        },
      },
      // Backend tests
      {
        resolve: {
          alias: {
            '@': path.resolve(__dirname, './src/backend'),
          },
        },
        test: {
          name: 'backend',
          globals: true,
          environment: 'node',
          setupFiles: ['./src/backend/__tests__/setup.ts'],
          include: ['src/backend/**/*.{test,spec}.{ts,tsx}'],
        },
      },
    ],
  },
});