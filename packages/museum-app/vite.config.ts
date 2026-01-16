/**
 * Input: 无
 * Output: Vite配置
 * 地位: museum-app的构建配置，定义开发和构建行为（包含 Gamma API 开发代理）
 * 一旦我被更新，请务必同时更新我的开头注释，以及所属目录的md
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';
import fs from 'fs';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // 自定义插件：在开发模式下服务构建后的demos
    {
      name: 'serve-demos',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          // 处理 /demos/ 路径
          if (req.url?.startsWith('/demos/')) {
            const filePath = resolve(__dirname, '../../dist', req.url.slice(1));

            // 如果请求的是目录，尝试返回 index.html
            let targetPath = filePath;
            if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
              targetPath = resolve(filePath, 'index.html');
            }

            if (fs.existsSync(targetPath)) {
              const content = fs.readFileSync(targetPath);
              const ext = targetPath.split('.').pop();
              const contentTypes: Record<string, string> = {
                html: 'text/html',
                css: 'text/css',
                js: 'application/javascript',
                json: 'application/json',
                png: 'image/png',
                jpg: 'image/jpeg',
                svg: 'image/svg+xml',
              };
              res.setHeader('Content-Type', contentTypes[ext || 'html'] || 'text/plain');
              res.end(content);
              return;
            }
          }

          // 处理 /index.json
          if (req.url === '/index.json') {
            const indexPath = resolve(__dirname, '../../dist/index.json');
            if (fs.existsSync(indexPath)) {
              const content = fs.readFileSync(indexPath);
              res.setHeader('Content-Type', 'application/json');
              res.end(content);
              return;
            }
          }

          next();
        });
      },
    },
  ],
  build: {
    outDir: '../../dist',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    proxy: {
      '/api/gamma': {
        target: 'https://gamma-api.polymarket.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/gamma/, ''),
      },
    },
  },
});
