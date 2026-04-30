import assert from "node:assert/strict";

import { createHarness } from "./helpers/sim-test-harness.js";

function loadAppHarness() {
  const harness = createHarness();
  harness.loadScript("grass.js");
  harness.loadScript("rabbit.js");

  harness.loadScript(
    "app.js",
    `
globalThis.__appApi = {
  initBackground,
  initWorld,
  drawWorld,
  updateSimulation,
  getBackgroundImageData: () => backgroundImageData,
  setBackgroundImageData: (next) => { backgroundImageData = next; }
};
`
  );

  return harness;
}

test("initBackground creates image data for world size", () => {
  const harness = createHarness();
  harness.loadScript("grass.js");
  harness.loadScript("rabbit.js");

  harness.loadScript(
    "app.js",
    `
globalThis.__appApi = {
  initBackground,
  getBackgroundImageData: () => backgroundImageData
};
`
  );

  harness.context.__appApi.initBackground();
  const imageData = harness.context.__appApi.getBackgroundImageData();

  assert.equal(imageData.width, 800);
  assert.equal(imageData.height, 600);
  assert.equal(imageData.data.length, 800 * 600 * 4);
});

test("initWorld calls all init steps", () => {
  const harness = createHarness();
  harness.loadScript("grass.js");
  harness.loadScript("rabbit.js");

  harness.loadScript(
    "app.js",
    `
globalThis.__calls = { initGrass: 0, initRabbits: 0 };
const originalInitGrass = initGrass;
const originalInitRabbits = initRabbits;
initGrass = function wrappedInitGrass() {
  globalThis.__calls.initGrass += 1;
  return originalInitGrass();
};
initRabbits = function wrappedInitRabbits() {
  globalThis.__calls.initRabbits += 1;
  return originalInitRabbits();
};
globalThis.__appApi = { initWorld };
`
  );

  harness.context.__calls.initGrass = 0;
  harness.context.__calls.initRabbits = 0;
  harness.context.__appApi.initWorld();

  assert.equal(harness.context.__calls.initGrass, 1);
  assert.equal(harness.context.__calls.initRabbits, 1);
});

test("drawWorld updates counters and draws world", () => {
  const harness = loadAppHarness();

  harness.context.__appApi.setBackgroundImageData(
    harness.canvasContext.createImageData(800, 600)
  );

  harness.context.__appApi.drawWorld();

  const grassCount = Number(harness.elements.grassCount.textContent.replace("Grass: ", ""));
  const rabbitCount = Number(harness.elements.rabbitCount.textContent.replace("Rabbits: ", ""));

  assert.equal(Number.isInteger(grassCount), true);
  assert.equal(Number.isInteger(rabbitCount), true);
  assert.equal(grassCount >= 0 && grassCount <= 810, true);
  assert.equal(rabbitCount >= 0 && rabbitCount <= 10, true);
  assert.equal(harness.canvasContext.calls.putImageData.length >= 1, true);
});

test("updateSimulation runs one update step and schedules next frame", () => {
  const harness = loadAppHarness();

  harness.context.__appApi.updateSimulation();

  assert.equal(harness.rafCalls.length >= 1, true);
  assert.equal(harness.rafCalls[harness.rafCalls.length - 1], harness.context.__appApi.updateSimulation);
});
