/** @type {import('vitest/config').UserConfig} */
module.exports = {
  test: {
    globals: true,
    include: ["tests/**/*.test.js"],
    coverage: {
      provider: "v8",
      include: ["tests/**/*.test.js"],
      exclude: ["tests/helpers/**", "node_modules/**"],
      reporter: ["text", "html"],
    },
  },
};
