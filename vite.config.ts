import path from "path";
import glsl from "vite-plugin-glsl";

import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  build: {
    outDir: "./dist",
  },
  test: {
    watch: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@@": path.resolve(__dirname),
    },
  },
  plugins: [glsl()],
});
