import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const devPort = Number(process.env.VITE_DEV_PORT || 5180);
const apiTarget = process.env.VITE_API_URL || `http://127.0.0.1:${process.env.VITE_DEV_API_PORT || "8095"}`;

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("@fortawesome")) return "fontawesome";
          if (id.includes("react-router")) return "router";
          if (id.includes("react-dom") || id.includes("/react/")) return "react";
        },
      },
    },
  },
  server: {
    host: true,
    port: devPort,
    strictPort: true,
    allowedHosts: [".devuko.ru", "localhost"],
    proxy: {
      "/crm-auth": { target: apiTarget, changeOrigin: true },
      "/admin": { target: apiTarget, changeOrigin: true },
    },
  },
});
