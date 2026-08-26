import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";

// package.json sets "type": "module", so __dirname does not exist here.
// Vite usually shims it when bundling the config, but relying on that is
// fragile — deriving it from import.meta.url is unambiguous.
const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "./src"),
    },
  },
  build: {
    // three.js is large and is already lazy-loaded by the Hero and Technology
    // Universe. Splitting it into its own chunk keeps it out of the initial
    // bundle and stops Vite emitting size warnings that look like failures.
    rollupOptions: {
      output: {
        manualChunks: {
          three: ["three", "@react-three/fiber", "@react-three/drei"],
          react: ["react", "react-dom"],
        },
      },
    },
    chunkSizeWarningLimit: 900,
  },
});
