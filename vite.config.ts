import { defineConfig } from 'vite';
import { resolve } from 'path';

// WebApp Configuration
export default defineConfig({
  root: 'webapp',
  base: './',
  build: {
    outDir: '../dist/webapp',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'webapp/index.html'),
      },
    },
  },
  resolve: {
    alias: {
      '@shared': resolve(__dirname, 'shared'),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
});
