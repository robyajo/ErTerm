import path from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      external: [
        // Native Node.js addons (.node binaries) — cannot be bundled by Vite/Rollup
        /\.node$/,
        // Packages that contain native addons — must be required at runtime
        "ssh2",
        "cpu-features",
        "node-pty",
      ],
    },
  },
});
