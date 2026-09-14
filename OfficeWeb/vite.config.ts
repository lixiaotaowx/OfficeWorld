import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  cacheDir: "../Build/vite-cache",
  build: { outDir: "../Build/OfficeWeb", emptyOutDir: true },
  plugins: [react()],
  server: {
    proxy: {
      "/socket.io": { target: "http://127.0.0.1:3108", ws: true },
      "/api": { target: "http://127.0.0.1:3108" },
    },
  },
});
