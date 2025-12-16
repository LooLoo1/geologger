import { defineConfig } from "tsup";
import { resolve } from "path";

export default defineConfig({
  entry: ["src/server.ts"],
  format: ["esm"],
  minify: false,
  sourcemap: true,
  clean: true,
  // Don't bundle - keep file structure
  bundle: false,
  dts: false,
  outDir: "dist",
  outExtension: () => ({ js: ".js" }),
  // Keep directory structure
  splitting: false,
  treeshake: false,
  esbuildOptions(options) {
    // Additional esbuild options
    options.platform = "node";
    // Support path aliases
    options.alias = {
      "@": resolve(process.cwd(), "src"),
      "@shared": resolve(process.cwd(), "src/shared"),
      "@modules": resolve(process.cwd(), "src/modules"),
      "@lib": resolve(process.cwd(), "src/lib"),
    };
    // Allow extensionless imports
    options.resolveExtensions = [".ts", ".tsx", ".js", ".jsx", ".json"];
  },
});

