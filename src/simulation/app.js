const canvas = document.getElementById("world");
const ctx = canvas.getContext("2d");
globalThis.ctx = ctx;
const mouseCoordsEl = document.getElementById("mouseCoords");

function getTerrainType(x, y) {
  const hm = globalThis.heightMap;
  if (!hm || !hm[y] || hm[y][x] === undefined) return "?";
  const v = hm[y][x];
  if (v <= 0.30) return "Vatten";
  if (v <= 0.55) return "Gräs";
  return "Torrt gräs";
}

canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const x = Math.floor((e.clientX - rect.left) * scaleX);
  const y = Math.floor((e.clientY - rect.top) * scaleY);
  const terrain = getTerrainType(x, y);
  mouseCoordsEl.textContent = `X: ${x} Y: ${y} — ${terrain}`;
});

canvas.addEventListener("mouseleave", () => {
  mouseCoordsEl.textContent = "X: - Y: -";
});
const rabbitCountEl = document.getElementById("rabbitCount");
const timeOfDayEl = document.getElementById("timeOfDay");
const dayOfYearEl = document.getElementById("dayOfYear");
const resetBtn = document.getElementById("resetBtn");

const TARGET_FPS = globalThis.SIM.render.targetFps;
const FRAME_MS = 1000 / TARGET_FPS;
const COUNTERS_UPDATE_MS = globalThis.SIM.render.countersUpdateMs;

let lastUpdateTime = 0;
let lastCountersUpdateTime = 0;
let lastRabbitCount = -1;

export function initWorld() {
  globalThis.resetTime();
  if (typeof globalThis.initTerrain === "function") {
    globalThis.initTerrain();
  }
  globalThis.initRabbits();
  lastUpdateTime = 0;
  lastCountersUpdateTime = 0;
  lastRabbitCount = -1;
}

function drawWorld(now) {
  ctx.clearRect(0, 0, globalThis.WIDTH, globalThis.HEIGHT);
  if (globalThis.SIM.terrain?.testMode) {
    if (globalThis.terrainCanvas) ctx.drawImage(globalThis.terrainCanvas, 0, 0);
    return;
  }
  if (globalThis.terrainCanvas) ctx.drawImage(globalThis.terrainCanvas, 0, 0);

  globalThis.drawRabbits();

  const shouldSyncCounters = now - lastCountersUpdateTime >= COUNTERS_UPDATE_MS;
  if (shouldSyncCounters) {
    const rabbitCount = globalThis.getRabbitCount();

    if (rabbitCount !== lastRabbitCount) {
      rabbitCountEl.textContent = `Rabbits: ${rabbitCount}`;
      lastRabbitCount = rabbitCount;
    }

    timeOfDayEl.textContent = `Time: ${globalThis.getClockString()}`;
    dayOfYearEl.textContent = `Day: ${globalThis.getDayOfYearString()}`;

    lastCountersUpdateTime = now;
  }
}

export function updateSimulation(timestamp = Date.now()) {
  if (lastUpdateTime === 0) {
    lastUpdateTime = timestamp;
  }
  const SAMPLE_SIZE = globalThis.SIM.terrain.sampleSize;
  for (let i = 0; i < SAMPLE_SIZE; i++) {
    const x = Math.floor(Math.random() * globalThis.WIDTH);
    const y = Math.floor(Math.random() * globalThis.HEIGHT);
    globalThis.lightGrassBecomesDarkGrass(x, y);
  }

  const elapsed = timestamp - lastUpdateTime;

  if (elapsed >= FRAME_MS) {
    globalThis.tickTime();
    globalThis.rabbitNormalWalk();
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