const INITIAL_RABBITS = 10;
const RABBIT_EAT_DISTANCE = 12;

let rabbits = [];

function getRabbitCenter(rabbit) {
  return {
    x: rabbit.x + rabbit.w / 2,
    y: rabbit.y + rabbit.h / 2,
  };
}

function getGrassCenter(g) {
  return {
    x: g.x + g.w / 2,
    y: g.y + g.currentH / 2,
  };
}


function initRabbits() {
  rabbits = [];
  for (let i = 0; i < INITIAL_RABBITS; i += 1) {
    const width = randomInt(15, 25);
    const height = randomInt(20, 30);

    rabbits.push({
      x: randomInt(0, WIDTH - width),
      y: randomInt(0, HEIGHT - height),
      w: width,
      h: height,
      speed: randomInt(1, 2),
      color: "rgb(255, 255, 255)",
    });
  }
}

function collisionWithRabbit (rabbitA, rabbitB) {
  if (rabbitA.x <= rabbitB.x + rabbitB.w &&
      rabbitA.x + rabbitA.w > rabbitB.x &&
      rabbitA.y <= rabbitB.y + rabbitB.h &&
      rabbitA.y + rabbitA.h > rabbitB.y) {
    return true;
  }
  return false;
}

function keepRabbitInBounds(rabbit) {
  rabbit.x = Math.max(0, Math.min(rabbit.x, WIDTH - rabbit.w));
  rabbit.y = Math.max(0, Math.min(rabbit.y, HEIGHT - rabbit.h));
}

function fixRabbitCollisions() {
  for (let i = 0; i < rabbits.length; i += 1) {
    const rabbitA = rabbits[i];

    for (let j = i + 1; j < rabbits.length; j += 1) {
      const rabbitB = rabbits[j];

      if (!collisionWithRabbit(rabbitA, rabbitB)) {
        continue;
      }

      const overlapX = Math.min(rabbitA.x + rabbitA.w, rabbitB.x + rabbitB.w) - Math.max(rabbitA.x, rabbitB.x);
      const overlapY = Math.min(rabbitA.y + rabbitA.h, rabbitB.y + rabbitB.h) - Math.max(rabbitA.y, rabbitB.y);

      if (overlapX <= 0 || overlapY <= 0) {
        continue;
      }

      if (overlapX < overlapY) {
        const pushX = overlapX / 2 || 1;

        if (rabbitA.x <= rabbitB.x) {
          rabbitA.x -= 2 * pushX;
          rabbitB.x += 2 * pushX;
        } else {
          rabbitA.x += 2 * pushX;
          rabbitB.x -= 2 * pushX;
        }
      } else {
        const pushY = overlapY / 2 || 1;

        if (rabbitA.y <= rabbitB.y) {
          rabbitA.y -= 2 * pushY;
          rabbitB.y += 2 * pushY;
        } else {
          rabbitA.y += 2 * pushY;
          rabbitB.y -= 2 * pushY;
        }
      }

      keepRabbitInBounds(rabbitA);
      keepRabbitInBounds(rabbitB);
    }
  }
}

function moveRabbits() {
  const grownGrass = grass.filter((g) => g.grown);
  if (grownGrass.length === 0) {
    return;
  }

  for (const rabbit of rabbits) {
    const rabbitCenter = getRabbitCenter(rabbit);
    let nearest = grownGrass[0];
    let bestDistanceSq = Number.POSITIVE_INFINITY;

    for (const g of grownGrass) {
      const grassCenter = getGrassCenter(g);
      const dx = grassCenter.x - rabbitCenter.x;
      const dy = grassCenter.y - rabbitCenter.y;
      const distanceSq = dx * dx + dy * dy;

      if (distanceSq < bestDistanceSq) {
        bestDistanceSq = distanceSq;
        nearest = g;
      }
    }

    const targetCenter = getGrassCenter(nearest);
    const dx = targetCenter.x - rabbitCenter.x;
    const dy = targetCenter.y - rabbitCenter.y;
    const distance = Math.hypot(dx, dy);

    if (distance > RABBIT_EAT_DISTANCE) {
      rabbit.x += (dx / distance) * rabbit.speed;
      rabbit.y += (dy / distance) * rabbit.speed;
    }

    keepRabbitInBounds(rabbit);
  }

  fixRabbitCollisions();
}

function rabbitIsCloseToGrass(rabbit, g) {
  const rabbitCenter = getRabbitCenter(rabbit);
  const grassCenter = getGrassCenter(g);

  return Math.hypot(grassCenter.x - rabbitCenter.x, grassCenter.y - rabbitCenter.y) <= RABBIT_EAT_DISTANCE;
}

function rabbitsEatGrass() {
  for (const rabbit of rabbits) {
    for (let i = 0; i < grass.length; i += 1) {
      const g = grass[i];
      if (g.grown && rabbitIsCloseToGrass(rabbit, g)) {
        grass[i] = { ...g, currentH: 1, grown: false };
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