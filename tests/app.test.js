import assert from "node:assert/strict";

import { createHarness } from "./helpers/sim-test-harness.js";

function loadAppHarness() {
  const harness = createHarness();
  harness.loadScript("src/simulation/grass.js");
  harness.loadScript("src/simulation/rabbit.js");

  harness.loadScript(
    "src/simulation/app.js",
    `
globalThis.__appApi = {
  initBackground,
  initWorld,
  drawWorld,
  updateSimulation,
  getBackgroundCanvas: () => backgroundCanvas,
  setBackgroundCanvas: (next) => { backgroundCanvas = next; }
};
`
  );

  return harness;
}

test("initBackground creates image data for world size", () => {
  const harness = createHarness();
  harness.loadScript("src/simulation/grass.js");
  harness.loadScript("src/simulation/rabbit.js");

  harness.loadScript(
    "src/simulation/app.js",
    `
globalThis.__appApi = {
  initBackground,
  getBackgroundCanvas: () => backgroundCanvas
};
`
  );

  harness.context.__appApi.initBackground();
  const bg = harness.context.__appApi.getBackgroundCanvas();

  assert.equal(bg.width, 800);
  assert.equal(bg.height, 608);
  assert.equal(harness.elements.world.style.backgroundImage, "none");
});

test("initWorld calls all init steps", () => {
  const harness = createHarness();
  harness.loadScript("src/simulation/grass.js");
  harness.loadScript("src/simulation/rabbit.js");

  harness.loadScript(
    "src/simulation/app.js",
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

  harness.context.__appApi.setBackgroundCanvas(
    harness.context.document.createElement("canvas")
  );

  harness.context.__appApi.drawWorld();

  const grassCount = Number(harness.elements.grassCount.textContent.replace("Grass: ", ""));
  const rabbitCount = Number(harness.elements.rabbitCount.textContent.replace("Rabbits: ", ""));

  assert.equal(Number.isInteger(grassCount), true);
  assert.equal(Number.isInteger(rabbitCount), true);
  assert.equal(grassCount >= 0 && grassCount <= 810, true);
  assert.equal(rabbitCount >= 0 && rabbitCount <= 10, true);
  assert.equal(harness.canvasContext.calls.putImageData.length, 0);
});

test("updateSimulation does not repaint background each frame", () => {
  const harness = loadAppHarness();

  const putImageDataBefore = harness.canvasContext.calls.putImageData.length;

  harness.context.__appApi.updateSimulation(1000);
  harness.context.__appApi.updateSimulation(2000);
  harness.context.__appApi.updateSimulation(3000);

  assert.equal(harness.canvasContext.calls.putImageData.length, putImageDataBefore);
});

test("updateSimulation runs one update step and schedules next frame", () => {
  const harness = loadAppHarness();

  harness.context.__appApi.updateSimulation();

  assert.equal(harness.rafCalls.length >= 1, true);
  assert.equal(harness.rafCalls[harness.rafCalls.length - 1], harness.context.__appApi.updateSimulation);
});
