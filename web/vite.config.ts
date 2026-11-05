import { defineConfig } from "vite";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { releaseFiles, releaseManifest } from "./scripts/release/assets";
import candidate from "./scripts/release/candidate.json";

export default defineConfig(({ mode }) => {
  const release = mode === "expedition-release";
  return {
    base: "./",
    // Release emits only the explicit runtime set; Vite must not copy public/ wholesale.
    publicDir: release ? false : "public",
    plugins: release ? [{
      name: "expedition-only-assets",
      generateBundle() {
        for (const file of releaseFiles()) {
          if (file.includes("..") || file.startsWith("/")) throw Error(`Unsafe release path: ${file}`);
          this.emitFile({ type: "asset", fileName: file,
            source: readFileSync(fileURLToPath(new URL(`./public/${file}`, import.meta.url))) });
        }
        this.emitFile({ type: "asset", fileName: "art/manifest.json",
          source: JSON.stringify(releaseManifest) + "\n" });
        this.emitFile({ type: "asset", fileName: "build-info.json", source: JSON.stringify({
          distribution: `expedition-only-${candidate.identifier}`,
          dirtyAtBuild: execFileSync("git", ["status", "--porcelain"], { encoding: "utf8" }).trim().length > 0,
          sourceRevision: execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim(),
          webTree: execFileSync("git", ["rev-parse", "HEAD:web"], { encoding: "utf8" }).trim(),
        }, null, 2) + "\n" });
      },
    }] : [],
    build: {
      outDir: release ? "dist-release" : "dist",
      target: "es2022",
      chunkSizeWarningLimit: 1500,
      rolldownOptions: {
        output: { codeSplitting: { groups: [{ name: "phaser", test: /node_modules\/phaser/ }] } },
      },
    },
  };
});
