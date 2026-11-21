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
    rollupOptions: {
      output: {
        // React gets its own chunk, matched by path. The old object form
        // ({ three: [...], react: [...] }) let React's internals be claimed by
        // the "three" chunk, because @react-three/fiber depends on React — so
        // the entry bundle imported React from the three.js chunk and the
        // whole ~1 MB of three.js loaded on every page view, including for
        // visitors who never see 3D.
        //
        // three.js itself is deliberately NOT forced into a named chunk:
        // Rollup already splits it out behind the two lazy() scene imports
        // (Hero, Technology Universe), so it downloads only when a scene
        // actually renders. test/build-output.test.ts enforces that it never
        // becomes part of the initial page load again.
        manualChunks(id) {
          if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) return "react";
        },
      },
    },
    // The lazily-loaded three.js chunk is ~840 kB minified (~230 kB gzipped).
    // That is expected for three.js and never on the initial page load.
    chunkSizeWarningLimit: 900,
  },
});
