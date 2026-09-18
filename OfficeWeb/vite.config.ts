import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
export default defineConfig({
  cacheDir: "../Build/vite-cache",
  build: {
    outDir: "../Build/OfficeWeb",
    emptyOutDir: true,
    rollupOptions: {
      // Two entries: the office itself, and the taskbar avatar strip (a separate small
      // window must not pull in three.js — it only needs React plus the avatar thumbs).
      input: {
        main: resolve(__dirname, "index.html"),
        dock: resolve(__dirname, "dock.html"),
      },
    },
  },
  plugins: [react()],
  // No dev-server proxy: the local 127.x run was removed on 2026-09-14. Vite is
  // kept for `vite build` and for the servers the browser tests start in-process.
});
