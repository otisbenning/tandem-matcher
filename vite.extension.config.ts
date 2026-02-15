import { defineConfig } from 'vite';
import { resolve } from 'path';

// Chrome Extension Configuration - Simple Build without crxjs
export default defineConfig({
  build: {
    outDir: 'dist/extension',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        'content-script': resolve(__dirname, 'extension/content/content-script.ts'),
        'service-worker': resolve(__dirname, 'extension/background/service-worker.ts'),
        'popup': resolve(__dirname, 'extension/popup/popup.ts'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
      },
    },
  },
  resolve: {
    alias: {
      '@shared': resolve(__dirname, 'shared'),
    },
  },
});
