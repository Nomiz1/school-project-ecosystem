const INITIAL_RABBITS = 10;

let rabbits = [];


function initRabbits() {
  rabbits = [];
  for (let i = 0; i < INITIAL_RABBITS; i += 1) {
    rabbits.push({
      x: randomInt(0, WIDTH),
      y: randomInt(0, HEIGHT),
      w: randomInt(15, 25),
      h: randomInt(20, 30),
      speed: randomInt(1, 2),
      color: "rgb(255, 255, 255)",
    });
  }
}

function collisionWithRabbit (a, b) {
  if (a.x <= b.x + b.w &&
      a.x + a.w > b.x &&
      a.y <= b.y + b.h &&
      a.y + a.h > b.y) {
    return true;
  }
  return false;
}

 

function moveRabbits() {
  const grownGrass = grass.filter((g) => g.grown);
  if (grownGrass.length === 0) {
    return;
  }

  for (const rabbit of rabbits) {
    let nearest = grownGrass[0];
    let bestDistanceSq = Number.POSITIVE_INFINITY;

    for (const g of grownGrass) {
      const dx = g.x - rabbit.x;
      const dy = g.y - rabbit.y;
      const distanceSq = dx * dx + dy * dy;

      if (distanceSq < bestDistanceSq) {
        bestDistanceSq = distanceSq;
        nearest = g;
      }
    }

    const dx = nearest.x - rabbit.x;
    const dy = nearest.y - rabbit.y;
    const distance = Math.hypot(dx, dy);

    if (distance > 0) {
      rabbit.x += (dx / distance) * rabbit.speed;
      rabbit.y += (dy / distance) * rabbit.speed;
    }
  }
}

function rabbitsEatGrass() {
  for (const rabbit of rabbits) {
    for (let i = 0; i < grass.length; i += 1) {
      const g = grass[i];
      if (g.grown && collisionWithRabbit(rabbit, g)) {
        grass[i] = { x: g.x, y: g.y, w: g.w, h: g.maxH, maxH: g.maxH, currentH: 2, grown: false };
        break;
      }
    }
  }
}

function drawRabbits(ctx) {
  for (const rabbit of rabbits) {
    ctx.fillStyle = rabbit.color;
    ctx.fillRect(Math.round(rabbit.x), Math.round(rabbit.y), rabbit.w, rabbit.h);
  }
}
