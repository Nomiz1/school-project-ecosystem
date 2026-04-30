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
    getGrassCollisionCircle,
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

  assert.ok(patch.w >= 15 && patch.w <= 20);
  assert.ok(patch.h >= 30 && patch.h <= 40);
  assert.ok(patch.x >= 0 && patch.x <= 800 - patch.w);
  assert.ok(patch.y >= 0 && patch.y <= 600 - patch.h);
  assert.equal(patch.currentH, 1);
  assert.equal(patch.grown, false);
});

test("getGrassCollisionCircle uses center point and min radius", () => {
  const { api } = loadGrassHarness();
  const patch = { x: 10, y: 20, w: 8, h: 20 };
  const circle = api.getGrassCollisionCircle(patch);

  assert.equal(circle.x, 14);
  assert.equal(circle.y, 30);
  assert.equal(circle.r, 4);
});

test("isGrassOverlapping returns true only for colliding patches", () => {
  const { api } = loadGrassHarness();
  api.setGrass([{ x: 100, y: 100, w: 20, h: 20 }]);

  assert.equal(api.isGrassOverlapping({ x: 110, y: 110, w: 20, h: 20 }), true);
  assert.equal(api.isGrassOverlapping({ x: 300, y: 300, w: 20, h: 20 }), false);
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

test("drawGrass draws one circle per patch", () => {
  const { harness, api } = loadGrassHarness();
  api.setGrass([
    { x: 10, y: 10, w: 20, h: 40, currentH: 20, grown: false },
    { x: 40, y: 40, w: 16, h: 16, currentH: 16, grown: true },
  ]);

  api.drawGrass(harness.canvasContext);

  assert.equal(harness.canvasContext.calls.beginPath, 1);
  assert.equal(harness.canvasContext.calls.arc.length, 2);
  assert.equal(harness.canvasContext.calls.fill, 1);
});
