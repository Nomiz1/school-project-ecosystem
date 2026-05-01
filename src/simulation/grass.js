const grassSimConfig = globalThis.SIM;
const grassRandomBetween = globalThis.randomInt;
const grassWorldWidth = globalThis.WIDTH;
const grassWorldHeight = globalThis.HEIGHT;

const INITIAL_GRASS = grassSimConfig.grass.initialCount;
const GRASS_GROWTH_PER_TICK = grassSimConfig.grass.growthPerTick;
const MIN_EATEN_GRASS_HEIGHT = grassSimConfig.grass.minEatenHeight;

const GRASS_HEIGHT_MIN = grassSimConfig.grass.heightMin;
const GRASS_HEIGHT_MAX = grassSimConfig.grass.heightMax;
const GRASS_WIDTH_MIN = grassSimConfig.grass.widthMin;
const GRASS_WIDTH_MAX = grassSimConfig.grass.widthMax;

const GRID_SIZE = 16;

let grass = [];
globalThis.grass = grass;

// --- Setup / spawning ---

function initGrass() {
  grass = [];
  globalThis.grass = grass;
  let attempts = 0;
  const maxAttempts = INITIAL_GRASS * 20;

  while (grass.length < INITIAL_GRASS && attempts < maxAttempts) {
    attempts += 1;
    const patch = createGrassPatch();

    if (!isGrassOverlapping(patch)) {
      grass.push(patch);
    }
  }
}

function getGrassCount() {
  return grass.length;
}

function createGrassPatch() {
  const cols = Math.floor(grassWorldWidth / GRID_SIZE);
  const rows = Math.floor(grassWorldHeight / GRID_SIZE);
  const col = grassRandomBetween(0, cols - 1);
  const row = grassRandomBetween(0, rows - 1);

  return {
    x: col * GRID_SIZE,
    y: row * GRID_SIZE,
    w: GRID_SIZE,
    h: GRID_SIZE,
    currentH: MIN_EATEN_GRASS_HEIGHT,
    grown: false,
  };
}

function isGrassOverlapping(patch) {
  for (const existingPatch of grass) {
    if (patch.x === existingPatch.x && patch.y === existingPatch.y) {
      return true;
    }
  }

  return false;
}

function getGrassCollisionCircle(patch) {
  const radius = Math.min(patch.w, patch.h) / 2;

  return {
    x: patch.x + patch.w / 2,
    y: patch.y + patch.h / 2,
    r: radius,
  };
}

// --- Growth ---

function growGrass() {
  for (let patchIndex = grass.length - 1; patchIndex >= 0; patchIndex -= 1) {
    const patch = grass[patchIndex];

    if (!patch.grown) {
      patch.currentH = Math.min(patch.currentH + GRASS_GROWTH_PER_TICK, patch.h);
      if (patch.currentH >= patch.h) {
        patch.grown = true;
      }
    }
  }
}

// --- Rendering ---

function drawGrass(ctx) {
  for (const patch of grass) {
    const growthRatio = patch.currentH / patch.h;
    const alpha = (0.3 + growthRatio * 0.7).toFixed(2);
    ctx.fillStyle = `rgba(68, 155, 46, ${alpha})`;
    ctx.fillRect(patch.x, patch.y, patch.w, patch.h);
  }
}

Object.assign(globalThis, {
  initGrass,
  getGrassCount,
  createGrassPatch,
  isGrassOverlapping,
  getGrassCollisionCircle,
  growGrass,
  drawGrass,
});

//For planing what to do next (quick notes):
// - Add a "biomass" property to grass that determines how much energy it gives to rabbits when eaten. This could be based on the current height of the grass.
// - Make the grass straws into grass patches (same propeties as grass straws but each patch takes up a larger area)
// - Make rabbits have a choice to switch to a different grass patch if the current one hs low biomass. 