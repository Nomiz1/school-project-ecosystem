const INITIAL_GRASS = 100;

let grass = [];

function createGrassPatch() {
  const maxH = randomInt(10, 15);
  return {
    x: randomInt(0, WIDTH),
    y: randomInt(0, HEIGHT),
    w: randomInt(3, 5),
    h: maxH,
    maxH,
    currentH: maxH,
    grown: true,
  };
}

function initGrass() {
  grass = [];
  for (let i = 0; i < INITIAL_GRASS; i += 1) {
    grass.push(createGrassPatch());
  }
}

function growGrass() {
  for (const g of grass) {
    if (!g.grown) {
      g.currentH = Math.min(g.currentH + 0.01, g.maxH);
      if (g.currentH >= g.maxH) {
        g.grown = true;
      }
    }
  }
}

function drawGrass(ctx) {
  ctx.fillStyle = "rgb(0, 255, 0)";
  for (const g of grass) {
    ctx.fillRect(g.x, g.y + (g.maxH - g.currentH), g.w, g.currentH);
  }
}
