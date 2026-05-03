const grassSimConfig = globalThis.SIM;
const grassRandomBetween = globalThis.randomInt;
const grassWorldWidth = globalThis.WIDTH;
const grassWorldHeight = globalThis.HEIGHT;

const INITIAL_GRASS = grassSimConfig.grass.initialCount;
const GRASS_GROWTH_PER_TICK = grassSimConfig.grass.growthPerTick; // Base growth per tick, modified by day/night cycle
const MIN_GRASS_LEVEL = grassSimConfig.grass.minGrassLevel; 

const GRID_SIZE = grassSimConfig.background.pixelSize;

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

function checkBiomassLevel(patch) {
  const bioMass = patch.currentLevel;
  return bioMass;
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
    currentLevel: MIN_GRASS_LEVEL,
    grown: false,
    checkBiomassLevel() {
      return this.currentLevel;
  },
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

// --- Growth ---

function growGrass(patch) {
  const { grassGrowthModifier } = globalThis.getDayNightModifiers();
  const growthThisTick = GRASS_GROWTH_PER_TICK * grassGrowthModifier;

  for (let patchIndex = grass.length - 1; patchIndex >= 0; patchIndex -= 1) {
    const patch = grass[patchIndex];

    if (!patch.grown) {
      patch.currentLevel = Math.min(patch.currentLevel + growthThisTick, patch.h);
      if (patch.currentLevel >= patch.h) {
        patch.grown = true;
      }
    }
  }
}

// --- Rendering ---

function drawGrass(ctx) {
  for (const patch of grass) {
    ctx.fillRect(patch.x, patch.y, patch.w, patch.h);
  }
}

Object.assign(globalThis, {
  initGrass,
  getGrassCount,
  createGrassPatch,
  isGrassOverlapping,
  growGrass,
  drawGrass,
  checkBiomassLevel,
});

//For planing what to do next (quick notes):
// - Add a "biomass" property to grass that determines how much energy it gives to rabbits when eaten. This could be based on the current level of the grass.
// - Make rabbits have a choice to switch to a different grass patch if the current one has low biomass. 