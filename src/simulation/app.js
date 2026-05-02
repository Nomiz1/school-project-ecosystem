const canvas = document.getElementById("world");
const ctx = canvas.getContext("2d");
globalThis.ctx = ctx;
const grassCountEl = document.getElementById("grassCount");
const rabbitCountEl = document.getElementById("rabbitCount");
const timeOfDayEl = document.getElementById("timeOfDay");
const dayOfYearEl = document.getElementById("dayOfYear");
const resetBtn = document.getElementById("resetBtn");

const BG_COLORS = globalThis.SIM.background.colors;
const BG_PIXEL_SIZE = globalThis.SIM.background.pixelSize;
const TARGET_FPS = globalThis.SIM.render.targetFps;
const FRAME_MS = 1000 / TARGET_FPS;
const COUNTERS_UPDATE_MS = globalThis.SIM.render.countersUpdateMs;

let backgroundCanvas = null;
let lastUpdateTime = 0;
let lastCountersUpdateTime = 0;
let lastGrassCount = -1;
let lastRabbitCount = -1;

function initBackground() {
  const offscreen = document.createElement("canvas");
  offscreen.width = globalThis.WIDTH;
  offscreen.height = globalThis.HEIGHT;
  const offCtx = offscreen.getContext("2d");

  for (let blockY = 0; blockY < globalThis.HEIGHT; blockY += BG_PIXEL_SIZE) {
    for (let blockX = 0; blockX < globalThis.WIDTH; blockX += BG_PIXEL_SIZE) {
      const [r, g, b] = BG_COLORS[globalThis.randomInt(0, BG_COLORS.length - 1)];
      offCtx.fillStyle = `rgb(${r},${g},${b})`;
      offCtx.fillRect(blockX, blockY, BG_PIXEL_SIZE, BG_PIXEL_SIZE);
    }
  }

  backgroundCanvas = offscreen;
  canvas.style.backgroundImage = "none";
}

function initWorld() {
  globalThis.resetTime();
  globalThis.initGrass();
  initBackground();
  globalThis.initRabbits();
  lastUpdateTime = 0;
  lastCountersUpdateTime = 0;
  lastGrassCount = -1;
  lastRabbitCount = -1;
}

function drawGrid() {
  const GRID_SIZE = BG_PIXEL_SIZE;
  ctx.save();
  ctx.strokeStyle = "rgba(0, 0, 0, 0.0)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = GRID_SIZE; x < globalThis.WIDTH; x += GRID_SIZE) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, globalThis.HEIGHT);
  }
  for (let y = GRID_SIZE; y < globalThis.HEIGHT; y += GRID_SIZE) {
    ctx.moveTo(0, y);
    ctx.lineTo(globalThis.WIDTH, y);
  }
  ctx.stroke();
  ctx.restore();
}

function drawWorld(now) {
  ctx.clearRect(0, 0, globalThis.WIDTH, globalThis.HEIGHT);
  if (backgroundCanvas) {
    ctx.drawImage(backgroundCanvas, 0, 0);
  }
  globalThis.drawDayNightOverlay(ctx);
  globalThis.drawGrass(ctx);
  globalThis.drawRabbits();
  drawGrid();

  const shouldSyncCounters = now - lastCountersUpdateTime >= COUNTERS_UPDATE_MS;
  if (shouldSyncCounters) {
    const grassCount = globalThis.getGrassCount();
    const rabbitCount = globalThis.getRabbitCount();

    if (grassCount !== lastGrassCount) {
      grassCountEl.textContent = `Grass: ${grassCount}`;
      lastGrassCount = grassCount;
    }

    if (rabbitCount !== lastRabbitCount) {
      rabbitCountEl.textContent = `Rabbits: ${rabbitCount}`;
      lastRabbitCount = rabbitCount;
    }

    timeOfDayEl.textContent = `Time: ${globalThis.getClockString()}`;
    dayOfYearEl.textContent = `Day: ${globalThis.getDayOfYearString()}`;

    lastCountersUpdateTime = now;
  }
}

function updateSimulation(timestamp = Date.now()) {
  if (lastUpdateTime === 0) {
    lastUpdateTime = timestamp;
  }

  const elapsed = timestamp - lastUpdateTime;

  if (elapsed >= FRAME_MS) {
    globalThis.tickTime();
    globalThis.rabbitNormalWalk();
    globalThis.rabbitEatGrass();
    globalThis.growGrass();
    drawWorld(timestamp);
    lastUpdateTime = timestamp;
  }

  window.requestAnimationFrame(updateSimulation);
}

resetBtn.addEventListener("click", () => {
  initWorld();
});

initWorld();
window.requestAnimationFrame(updateSimulation);
