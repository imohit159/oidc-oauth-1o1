import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["./src/server.ts"],
  format: ["cjs"],
  bundle: true,
  outDir: "./dist",
  clean: true,
  minify: true,
  sourcemap: true,
  env: {
    NODE_ENV: "production",
  },
});
