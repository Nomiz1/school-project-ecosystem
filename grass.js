const INITIAL_GRASS = 1300;


let grass = [];

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

function getGrassCollisionCircle(patch) {
  const radius = Math.min(patch.w, patch.h) / 2;

  return {
    x: patch.x + patch.w / 2,
    y: patch.y + patch.h / 2,
    r: radius,
  };
}

function grassOverlaps(patch) {
  const gap = 2;
  const newCircle = getGrassCollisionCircle(patch);

  for (const g of grass) {
    const existingCircle = getGrassCollisionCircle(g);
    const dx = newCircle.x - existingCircle.x;
    const dy = newCircle.y - existingCircle.y;
    const minDistance = newCircle.r + existingCircle.r + gap;

    if (dx * dx + dy * dy < minDistance * minDistance) {
      return true;
    }
  }

  return false;
}

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

function growGrass() {
  for (let i = grass.length - 1; i >= 0; i -= 1) {
    const g = grass[i];
    
    if (!g.grown) {
      g.currentH = Math.min(g.currentH + 0.1, g.h);
      if (g.currentH >= g.h) {
        g.grown = true;
      }
    }
  }
}

function drawGrass(ctx) {
  ctx.fillStyle = "rgba(68, 155, 46, 0.63)";
  for (const g of grass) {
    const baseRadius = Math.min(g.w, g.h) / 2;
    const growthRatio = g.currentH / g.h;
    const radius = Math.max(1, baseRadius * growthRatio);
    const centerX = g.x + g.w / 2;
    const centerY = g.y + g.h / 2;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

//For planing what to do next (quick notes):
// - Add a "biomass" property to grass that determines how much energy it gives to rabbits when eaten. This could be based on the current height of the grass.
// - Make the grass straws into grass patches (same propeties as grass straws but each patch takes up a larger area)
// - Make rabbits have a choice to switch to a different grass patch if the current one hs low biomass. 