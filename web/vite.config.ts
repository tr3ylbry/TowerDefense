import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  build: {
    target: "es2022",
    // Phaser is intentionally isolated; its compressed payload is about 357 KB.
    chunkSizeWarningLimit: 1500,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [{ name: "phaser", test: /node_modules\/phaser/ }],
        },
      },
    },
  },
});
