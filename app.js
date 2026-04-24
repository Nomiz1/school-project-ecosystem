const WIDTH = 800;
const HEIGHT = 600;
const INITIAL_GRASS = 100;
const INITIAL_RABBITS = 10;

const canvas = document.getElementById("world");
const ctx = canvas.getContext("2d");
const grassCountEl = document.getElementById("grassCount");
const resetBtn = document.getElementById("resetBtn");

let grass = [];
let rabbits = [];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function initWorld() {
  grass = [];
  rabbits = [];

  for (let i = 0; i < INITIAL_GRASS; i += 1) {
    grass.push({
      x: randomInt(0, WIDTH),
      y: randomInt(0, HEIGHT),
      w: randomInt(3, 5),
      h: randomInt(10, 15),
    });
  }

  const sharedRabbitSpeed = randomInt(1, 3);

  for (let i = 0; i < INITIAL_RABBITS; i += 1) {
    rabbits.push({
      x: randomInt(0, WIDTH),
      y: randomInt(0, HEIGHT),
      w: randomInt(15, 25),
      h: randomInt(20, 30),
      speed: sharedRabbitSpeed,
      color: "rgb(255, 255, 255)",
    });
  }
}

function moveRabbits() {
  if (grass.length === 0) {
    return;
  }

  for (const rabbit of rabbits) {
    let nearest = grass[0];
    let bestDistanceSq = Number.POSITIVE_INFINITY;

    for (const g of grass) {
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
      rabbit.x += Math.trunc((dx / distance) * rabbit.speed);
      rabbit.y += Math.trunc((dy / distance) * rabbit.speed);
    }
  }
}

function rabbitsEatGrass() {
  for (const rabbit of rabbits) {
    for (let i = 0; i < grass.length; i += 1) {
      const g = grass[i];
      if (Math.abs(rabbit.x - g.x) < 5 && Math.abs(rabbit.y - g.y) < 5) {
        grass.splice(i, 1);
        break;
      }
    }
  }
}

function drawWorld() {
  ctx.fillStyle = "rgb(150, 75, 0)";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.fillStyle = "rgb(0, 255, 0)";
  for (const g of grass) {
    ctx.fillRect(g.x, g.y, g.w, g.h);
  }

  for (const rabbit of rabbits) {
    ctx.fillStyle = rabbit.color;
    ctx.fillRect(rabbit.x, rabbit.y, rabbit.w, rabbit.h);
  }

  grassCountEl.textContent = `Grass: ${grass.length}`;
}

function tick() {
  moveRabbits();
  rabbitsEatGrass();
  drawWorld();
  window.requestAnimationFrame(tick);
}

resetBtn.addEventListener("click", () => {
  initWorld();
});

initWorld();
drawWorld();
window.requestAnimationFrame(tick);
