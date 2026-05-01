import assert from "node:assert/strict";

import { createHarness } from "./helpers/sim-test-harness.js";

function loadGrassHarness(simOverrides = {}) {
  const harness = createHarness({ simOverrides });
  harness.loadScript("src/simulation/grass.js");
  const api = harness.expose(`({
    initGrass,
    getGrassCount,
    createGrassPatch,
    isGrassOverlapping,
    growGrass,
    drawGrass,
    setGrass: (next) => { grass = next; },
    getGrass: () => grass
  })`);

  return { harness, api };
}

test("createGrassPatch creates a valid patch", () => {
  const { api } = loadGrassHarness();
  const patch = api.createGrassPatch();

  assert.equal(patch.w, 16);
  assert.equal(patch.h, 16);
  assert.ok(patch.x >= 0 && patch.x % 16 === 0 && patch.x <= 800 - 16);
  assert.ok(patch.y >= 0 && patch.y % 16 === 0 && patch.y <= 608 - 16);
  assert.equal(patch.currentH, 1);
  assert.equal(patch.grown, false);
});

test("isGrassOverlapping returns true only for colliding patches", () => {
  const { api } = loadGrassHarness();
  api.setGrass([{ x: 96, y: 96, w: 16, h: 16 }]);

  assert.equal(api.isGrassOverlapping({ x: 96, y: 96, w: 16, h: 16 }), true);
  assert.equal(api.isGrassOverlapping({ x: 112, y: 96, w: 16, h: 16 }), false);
});

test("growGrass increases current height until grown", () => {
  const { api } = loadGrassHarness({ grass: { growthPerTick: 2 } });
  api.setGrass([
    { x: 0, y: 0, w: 10, h: 12, currentH: 10, grown: false },
    { x: 0, y: 0, w: 10, h: 12, currentH: 12, grown: true },
  ]);

  api.growGrass();
  const [first, second] = api.getGrass();

  assert.equal(first.currentH, 12);
  assert.equal(first.grown, true);
  assert.equal(second.currentH, 12);
  assert.equal(second.grown, true);
});

test("initGrass fills up to initialCount and getGrassCount matches", () => {
  const { api } = loadGrassHarness({ grass: { initialCount: 12 } });

  api.initGrass();

  assert.equal(api.getGrassCount(), 12);
});

test("drawGrass draws one filled rectangle per patch", () => {
  const { harness, api } = loadGrassHarness();
  api.setGrass([
    { x: 10, y: 10, w: 16, h: 16, currentH: 8, grown: false },
    { x: 32, y: 32, w: 16, h: 16, currentH: 16, grown: true },
  ]);

  api.drawGrass(harness.canvasContext);

  assert.equal(harness.canvasContext.calls.fillRect.length, 2);
  assert.deepEqual(harness.canvasContext.calls.fillRect[0], [10, 10, 16, 16]);
  assert.deepEqual(harness.canvasContext.calls.fillRect[1], [32, 32, 16, 16]);
});
