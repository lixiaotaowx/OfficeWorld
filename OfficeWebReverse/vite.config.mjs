import { resolve } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';
import { defineConfig } from 'vite';

const devCert = new URL('./.dev-certs/dev.cert.pem', import.meta.url);
const devKey = new URL('./.dev-certs/dev.key.pem', import.meta.url);
const devOrigin = 'https://127.0.0.1:5173';
const officeOrigin = 'https://115.159.43.237';
const localBackend = 'http://127.0.0.1:3108';

function configureOfficeProxy(proxy) {
  const forwardSameOrigin = (proxyRequest, request) => {
    if (request.headers.origin === devOrigin) proxyRequest.setHeader('Origin', officeOrigin);
  };
  proxy.on('proxyReq', forwardSameOrigin);
  proxy.on('proxyReqWs', forwardSameOrigin);
}

export default defineConfig(({ command }) => {
  const livePreview = command === 'serve' && existsSync(devCert) && existsSync(devKey);
  const httpProxy = {
    target: livePreview ? officeOrigin : localBackend,
    changeOrigin: livePreview,
    ...(livePreview && { configure: configureOfficeProxy }),
  };

  return {
    publicDir: 'public',
    server: {
      ...(livePreview && { https: { cert: readFileSync(devCert), key: readFileSync(devKey) } }),
      port: 5173,
      host: '127.0.0.1',
      proxy: {
        '/api': httpProxy,
        '/socket.io': { ...httpProxy, ws: true },
      },
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      chunkSizeWarningLimit: 4000,
      rollupOptions: {
        input: {
          main: resolve(import.meta.dirname, 'index.html'),
          dock: resolve(import.meta.dirname, 'dock.html'),
          host: resolve(import.meta.dirname, 'host.html'),
        },
      },
    },
  };
});
