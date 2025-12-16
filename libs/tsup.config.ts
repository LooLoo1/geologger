import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  clean: true,
  splitting: false,
  // Watch mode options
  onSuccess: "echo '✅ Shared package built successfully'",
});

