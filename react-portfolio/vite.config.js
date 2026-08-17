import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import fs from 'fs'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  base: '/admin/',
  plugins: [
    react(),
    {
      name: 'serve-parent-static',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          // If the request is for the root or standard static files (which the iframe needs)
          // and it does NOT start with /admin/ or /src/, serve from the parent directory.
          const urlPath = req.url.split('?')[0];
          
          if (urlPath === '/' || urlPath === '/index.html' || urlPath.endsWith('.html') || urlPath.endsWith('.js') || urlPath.endsWith('.css') || urlPath.endsWith('.mp4') || urlPath.endsWith('.webm') || urlPath.endsWith('.png') || urlPath.endsWith('.jpg')) {
            
            // Bypass internal Vite requests
            if (urlPath.startsWith('/@') || urlPath.startsWith('/src/') || urlPath.startsWith('/admin/') || urlPath.startsWith('/node_modules/')) {
              return next();
            }

            const parentFile = path.resolve(__dirname, '..', urlPath === '/' ? 'index.html' : urlPath.replace(/^\//, ''));
            
            if (fs.existsSync(parentFile)) {
              const ext = path.extname(parentFile);
              if (ext === '.js') res.setHeader('Content-Type', 'application/javascript');
              else if (ext === '.css') res.setHeader('Content-Type', 'text/css');
              else if (ext === '.html' || ext === '') res.setHeader('Content-Type', 'text/html');
              else if (ext === '.mp4') res.setHeader('Content-Type', 'video/mp4');
              
              res.end(fs.readFileSync(parentFile));
              return;
            }
          }
          next();
        });
      }
    }
  ],
  build: {
    outDir: '../admin',
    emptyOutDir: true
  }
})
