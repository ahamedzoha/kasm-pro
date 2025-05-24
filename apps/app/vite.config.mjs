/// <reference types='vitest' />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  root: __dirname,
  cacheDir: "../../node_modules/.vite/apps/app",
  server: {
    port: 4200,
    host: "localhost",
  },
  preview: {
    port: 4200,
    host: "0.0.0.0",
    proxy: {
      "/api": {
        target: process.env.API_GATEWAY_URL || "http://api-gateway:9600",
        changeOrigin: true,
        secure: false,
      },
      "/terminal": {
        target: process.env.API_GATEWAY_URL || "http://api-gateway:9600",
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
  plugins: [react(), tailwindcss()],
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@kasm-pro/ui": path.resolve(__dirname, "../../libs/ui/src"),
      "@kasm-pro/util": path.resolve(__dirname, "../../libs/util/src"),
      "@kasm-pro/terminal": path.resolve(__dirname, "../../libs/terminal/src"),
      "@kasm-pro/validation": path.resolve(
        __dirname,
        "../../libs/validation/src"
      ),
      "@kasm-pro/api-interfaces": path.resolve(
        __dirname,
        "../../libs/api-interfaces/src"
      ),
    },
  },

  build: {
    outDir: "./dist",
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
});
