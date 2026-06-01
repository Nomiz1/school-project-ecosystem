/** @type {import('vitest/config').UserConfig} */
export default {
  test: {
    setupFiles: ["./tests/helpers/sim-test-harness.js"],
    globals: true,
    environment: "jsdom",
    include: ["tests/**/*.test.js"],
    coverage: {
      provider: "v8",
      include: ["tests/**/*.test.js"],
      exclude: ["tests/helpers/**", "node_modules/**"],
      reporter: ["text", "html"],
    },
  },
};
