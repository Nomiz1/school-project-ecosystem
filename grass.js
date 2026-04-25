const INITIAL_GRASS = 1700;


let grass = [];

function createGrassPatch() {
  const maxHeight = randomInt(20, 40);
  const width = randomInt(3, 4);

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

  for (const g of grass) {
    if (patch.x < g.x + g.w + gap &&
        patch.x + patch.w + gap > g.x &&
        patch.y < g.y + g.h + gap &&
        patch.y + patch.h + gap > g.y) {
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
    ctx.fillRect(g.x, g.y + (g.h - g.currentH), g.w, g.currentH);
  }
}
