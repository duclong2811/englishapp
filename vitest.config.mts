import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: { environment: "jsdom", setupFiles: ["./src/test/setup.ts"] },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
      // Next.js cung cấp package ảo "server-only"; ngoài Next ta dùng stub để test được lớp dữ liệu.
      "server-only": path.resolve(import.meta.dirname, "./src/test/server-only.ts"),
    },
  },
});
