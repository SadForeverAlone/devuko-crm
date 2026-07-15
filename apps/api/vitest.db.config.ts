import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

/** DB integration tests boot the full Nest AppModule — needs decorator metadata (SWC). */
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/test/db.integration.test.ts"],
    testTimeout: 60_000,
    hookTimeout: 60_000,
    pool: "forks",
    poolOptions: { forks: { singleFork: true } },
  },
  plugins: [
    swc.vite({
      module: { type: "es6" },
      jsc: {
        parser: { syntax: "typescript", decorators: true },
        transform: { legacyDecorator: true, decoratorMetadata: true },
      },
    }),
  ],
});
