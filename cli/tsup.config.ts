import { defineConfig } from "tsup";
import { cp } from "node:fs/promises";
import path from "node:path";

export default defineConfig({
  entry: {
    "bin/dogfood": "bin/dogfood.ts",
    index: "src/index.ts",
  },
  format: ["esm"],
  target: "node20",
  dts: {
    entry: "src/index.ts",
  },
  splitting: true,
  sourcemap: true,
  clean: true,
  shims: false,
  async onSuccess() {
    // Copy template files to dist so they're available at runtime
    await cp(
      path.resolve("src/templates"),
      path.resolve("dist/templates"),
      { recursive: true },
    );
    console.log("✔ Copied templates to dist/templates");
  },
});
