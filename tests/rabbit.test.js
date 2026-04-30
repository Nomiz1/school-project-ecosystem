import assert from "node:assert/strict";

import { createHarness } from "./helpers/sim-test-harness.js";

function loadRabbitHarness(simOverrides = {}) {
  const harness = createHarness({ simOverrides });
  harness.loadScript("grass.js");
  harness.loadScript("rabbit.js");

  const api = harness.expose(`({
    initRabbits,
    getRabbitCount,
    createRabbit,
    isNewRabbitOverlapping,
    rabbitNormalWalk,
    isRabbitOverlappingGrass,
    rabbitEatGrass,
    getRabbitCollisionBox,
    getGrassVisibleCollisionBox,
    areBoxesOverlapping,
    drawRabbits,
    setRabbits: (next) => { rabbits = next; },
    getRabbits: () => rabbits,
    setGrass: (next) => { grass = next; },
    getGrass: () => grass
  })`);

  return { harness, api };
}

test("createRabbit creates a valid rabbit", () => {
  const { api } = loadRabbitHarness();
  const rabbit = api.createRabbit();

  assert.ok(rabbit.w >= 5 && rabbit.w <= 10);
  assert.ok(rabbit.h >= 15 && rabbit.h <= 20);
  assert.ok(rabbit.speed >= 1 && rabbit.speed <= 3);
  assert.ok(rabbit.x >= 0 && rabbit.x <= 800 - rabbit.w);
  assert.ok(rabbit.y >= 0 && rabbit.y <= 600 - rabbit.h);
  assert.equal(rabbit.jumpVx, 0);
  assert.equal(rabbit.jumpVy, 0);
});

test("isNewRabbitOverlapping detects overlap", () => {
  const { api } = loadRabbitHarness();
  api.setRabbits([{ x: 10, y: 10, w: 10, h: 10 }]);

  assert.equal(api.isNewRabbitOverlapping({ x: 15, y: 15, w: 10, h: 10 }), true);
  assert.equal(api.isNewRabbitOverlapping({ x: 100, y: 100, w: 10, h: 10 }), false);
});

test("initRabbits creates rabbits and getRabbitCount returns length", () => {
  const { api } = loadRabbitHarness({ rabbits: { initialCount: 6 } });

  api.initRabbits();

  assert.equal(api.getRabbitCount(), 6);
});

test("rabbitNormalWalk moves rabbit and clamps to bounds", () => {
  const { harness, api } = loadRabbitHarness();
  harness.context.randomInt = () => 0;

  api.setRabbits([
    {
      x: 799,
      y: 599,
      w: 10,
      h: 10,
      speed: 2,
      angle: 0,
      jumpChance: 0,
      jumpPower: 0,
      jumpVx: 0,
      jumpVy: 0,
    },
  ]);

  api.rabbitNormalWalk();

  const rabbit = api.getRabbits()[0];
  assert.equal(rabbit.x, 790);
  assert.equal(rabbit.y, 590);
});

test("collision helper functions return expected values", () => {
  const { api } = loadRabbitHarness();

  const rabbitBox = api.getRabbitCollisionBox({ x: 1, y: 2, w: 3, h: 4 });
  assert.equal(rabbitBox.x, 1);
  assert.equal(rabbitBox.y, 2);
  assert.equal(rabbitBox.w, 3);
  assert.equal(rabbitBox.h, 4);

  const patchBox = api.getGrassVisibleCollisionBox({ x: 10, y: 20, w: 20, h: 20, currentH: 10 });
  assert.equal(patchBox.x, 15);
  assert.equal(patchBox.y, 25);
  assert.equal(patchBox.w, 10);
  assert.equal(patchBox.h, 10);

  assert.equal(
    api.areBoxesOverlapping({ x: 0, y: 0, w: 10, h: 10 }, { x: 5, y: 5, w: 10, h: 10 }),
    true
  );
  assert.equal(
    api.areBoxesOverlapping({ x: 0, y: 0, w: 10, h: 10 }, { x: 20, y: 20, w: 5, h: 5 }),
    false
  );
});

test("isRabbitOverlappingGrass returns true when boxes overlap", () => {
  const { api } = loadRabbitHarness();
  const rabbit = { x: 10, y: 10, w: 10, h: 10 };
  const patch = { x: 10, y: 10, w: 20, h: 20, currentH: 20 };

  assert.equal(api.isRabbitOverlappingGrass(rabbit, patch), true);
});

test("rabbitEatGrass eats only grown overlapping grass", () => {
  const { harness, api } = loadRabbitHarness({
    rabbits: { eatChance: 1 },
    grass: { eatenHeightFactor: 0.1, minEatenHeight: 1 },
  });

  harness.context.Math.random = () => 0;

  api.setRabbits([{ x: 10, y: 10, w: 10, h: 10 }]);
  api.setGrass([
    { x: 10, y: 10, w: 20, h: 20, currentH: 20, grown: true },
    { x: 200, y: 200, w: 20, h: 20, currentH: 20, grown: true },
    { x: 10, y: 10, w: 20, h: 20, currentH: 20, grown: false },
  ]);

  api.rabbitEatGrass();

  const [first, second, third] = api.getGrass();
  assert.equal(first.currentH, 2);
  assert.equal(first.grown, false);
  assert.equal(second.currentH, 20);
  assert.equal(second.grown, true);
  assert.equal(third.currentH, 20);
  assert.equal(third.grown, false);
});

test("drawRabbits draws one rectangle per rabbit", () => {
  const { harness, api } = loadRabbitHarness();
  harness.context.ctx = harness.canvasContext;

  api.setRabbits([
    { x: 1, y: 2, w: 3, h: 4 },
    { x: 5, y: 6, w: 7, h: 8 },
  ]);

  api.drawRabbits();

  assert.equal(harness.canvasContext.calls.fillRect.length, 2);
});
