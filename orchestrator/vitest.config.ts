import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname),
    },
  },
  test: {
    environment: "node",
    globals: false,
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary"],
      include: ["lib/**/*.ts", "app/api/**/*.ts"],
      exclude: ["**/*.test.ts", "**/types.ts"],
    },
  },
});
