import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  cacheDir: "../Build/vite-cache",
  plugins: [react()],
  server: {
    proxy: { "/socket.io": { target: "http://127.0.0.1:3108", ws: true } },
  },
});
