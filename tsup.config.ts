import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    client: "src/router/client.ts",
    server: "src/router/server.ts",
  },
  format: ["esm"],
  dts: true,
});
