import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    strictPort: true,
    open: true,
    fs: {
      strict: true,
      allow: ['..'],
    },
  },
  css: {
    modules: {
      localsConvention: 'camelCase',
      scopeBehaviour: 'local',
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
}); 