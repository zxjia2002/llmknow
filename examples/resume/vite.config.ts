import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react({
    // This is needed to suppress JSX errors in TypeScript files
    jsxRuntime: 'automatic'
  })],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    strictPort: false,
    fs: {
      allow: ['..'],
    },
    proxy: {
      // 简化代理路径
      '/api/coze': {
        target: 'https://api.coze.com',
        changeOrigin: true,
        rewrite: (path) => {
          console.log('Rewriting path:', path);
          return path.replace(/^\/api\/coze/, '');
        },
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('Proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request:', req.method, req.url, '->',
              proxyReq.protocol + '//' + proxyReq.host + proxyReq.path);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response:', req.url, 
              'Status:', proxyRes.statusCode,
              'Headers:', JSON.stringify(proxyRes.headers));
          });
        },
      },
    },
  },
}); 