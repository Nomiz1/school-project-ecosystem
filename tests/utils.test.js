import assert from "node:assert/strict";

import { createHarness } from "./helpers/sim-test-harness.js";

test("randomInt is inclusive for both min and max", () => {
  const harness = createHarness();
  const api = harness.expose("({ randomInt })");

  harness.context.Math.random = () => 0;
  assert.equal(api.randomInt(3, 7), 3);

  harness.context.Math.random = () => 0.999999999;
  assert.equal(api.randomInt(3, 7), 7);
});

test("world constants are loaded from SIM", () => {
  const harness = createHarness();
  const constants = harness.expose("({ WIDTH, HEIGHT, BORDER })");

  assert.equal(constants.WIDTH, 800);
  assert.equal(constants.HEIGHT, 608);
  assert.equal(constants.BORDER, 10);
});
