import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globalSetup: ["./src/spec/global-setup.ts"],
    setupFiles: ["./src/spec/setup.ts"],
    typecheck: {
      enabled: true,
      include: ["src/**/*.spec.ts"],
    },
  },
});
