const INITIAL_GRASS = 810;

let grass = [];

// --- Setup / spawning ---

function initGrass() {
  grass = [];
  let attempts = 0;
  const maxAttempts = INITIAL_GRASS * 20;

  while (grass.length < INITIAL_GRASS && attempts < maxAttempts) {
    attempts += 1;
    const patch = createGrassPatch();

    if (!grassOverlaps(patch)) {
      grass.push(patch);
    }
  }
}

function createGrassPatch() {
  const maxHeight = randomInt(30, 40);
  const width = randomInt(15, 20);

  return {
    x: randomInt(0, WIDTH - width),
    y: randomInt(0, HEIGHT - maxHeight),
    w: width,
    h: maxHeight,
    currentH: 1,
    grown: false,
  };
}

function grassOverlaps(patch) {
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
      patch.currentH = Math.min(patch.currentH + 0.1, patch.h);
      if (patch.currentH >= patch.h) {
        patch.grown = true;
      }
    }
  }
}

// --- Rendering ---

function drawGrass(ctx) {
  ctx.fillStyle = "rgba(68, 155, 46, 0.63)";
  for (const patch of grass) {
    const baseRadius = Math.min(patch.w, patch.h) / 2;
    const growthRatio = patch.currentH / patch.h;
    const radius = Math.max(1, baseRadius * growthRatio);
    const centerX = patch.x + patch.w / 2;
    const centerY = patch.y + patch.h / 2;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

//For planing what to do next (quick notes):
// - Add a "biomass" property to grass that determines how much energy it gives to rabbits when eaten. This could be based on the current height of the grass.
// - Make the grass straws into grass patches (same propeties as grass straws but each patch takes up a larger area)
// - Make rabbits have a choice to switch to a different grass patch if the current one hs low biomass. 