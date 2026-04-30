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
  const maxHeight = grassRandomBetween(GRASS_HEIGHT_MIN, GRASS_HEIGHT_MAX);
  const width = grassRandomBetween(GRASS_WIDTH_MIN, GRASS_WIDTH_MAX);

  return {
    x: grassRandomBetween(0, grassWorldWidth - width),
    y: grassRandomBetween(0, grassWorldHeight - maxHeight),
    w: width,
    h: maxHeight,
    currentH: MIN_EATEN_GRASS_HEIGHT,
    grown: false,
  };
}

function isGrassOverlapping(patch) {
  const gap = 2;
  const candidatePatchCircle = getGrassCollisionCircle(patch);

  for (const existingPatch of grass) {
    const existingPatchCircle = getGrassCollisionCircle(existingPatch);
    const deltaX = candidatePatchCircle.x - existingPatchCircle.x;
    const deltaY = candidatePatchCircle.y - existingPatchCircle.y;
    const minDistance = candidatePatchCircle.r + existingPatchCircle.r + gap;

    if (deltaX * deltaX + deltaY * deltaY < minDistance * minDistance) {
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
  ctx.fillStyle = "rgba(68, 155, 46, 0.63)";
  ctx.beginPath();

  for (const patch of grass) {
    const baseRadius = Math.min(patch.w, patch.h) / 2;
    const growthRatio = patch.currentH / patch.h;
    const radius = Math.max(1, baseRadius * growthRatio);
    const centerX = patch.x + patch.w / 2;
    const centerY = patch.y + patch.h / 2;

    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  }

  ctx.fill();
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