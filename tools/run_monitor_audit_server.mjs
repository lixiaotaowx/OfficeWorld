import { createServer } from './WebRuntime/node_modules/vite/dist/node/index.js';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../OfficeWeb', import.meta.url));
const three = fileURLToPath(new URL('./WebRuntime/node_modules/three', import.meta.url));
const modules = fileURLToPath(new URL('./WebRuntime/node_modules', import.meta.url));
const server = await createServer({
  configFile: false,
  esbuild: { jsx: 'automatic' },
  root,
  cacheDir: '../Build/monitor-vite-cache',
  resolve: { alias: [
    { find: 'three/addons', replacement: `${three}/examples/jsm` },
    { find: /^three$/, replacement: `${three}/build/three.module.js` },
    { find: 'react-dom', replacement: `${modules}/react-dom` },
    { find: 'react', replacement: `${modules}/react` },
  ] },
  optimizeDeps: { entries: ['test/screen-fit.html'] },
  server: { host: '127.0.0.1', port: 5199, strictPort: true },
});
await server.listen();
server.printUrls();
