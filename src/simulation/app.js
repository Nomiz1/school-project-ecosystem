import { t } from "./language.js";

const canvas = document.getElementById("world");
const ctx = canvas.getContext("2d");
globalThis.ctx = ctx;
const mouseCoordsEl = document.getElementById("mouseCoords");

export function getTerrainType(x, y) {
  const hm = globalThis.heightMap;
  if (!hm || !hm[y] || hm[y][x] === undefined) return t("terrainUnknown", "?");
  const v = hm[y][x];
  if (v <= 0.30) return t("terrainWater", "Water");
  if (v <= 0.55) return t("terrainGrass", "Grass");
  return t("terrainDryGrass", "Dry grass");
}

function localizeStaticUi() {
  if (typeof document !== "undefined") {
    document.title = t("pageTitle", "School Ecosystem Simulation");
    if (document.documentElement) {
      document.documentElement.lang = globalThis.SIM?.i18n?.locale || "sv-SE";
    }
  }

  if (typeof document.querySelector === "function") {
    const titleEl = document.querySelector(".title-group h1");
    if (titleEl) {
      titleEl.textContent = t("appTitle", "Ecosystem Simulation");
    }

    const subtitleEl = document.querySelector(".title-group .subtitle");
    if (subtitleEl) {
      subtitleEl.textContent = t("subtitle", "By: Zimon Roos");
    }
  }

  if (typeof canvas.setAttribute === "function") {
    canvas.setAttribute("aria-label", t("canvasAria", "Ecosystem simulation canvas"));
  }
}

canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const x = Math.floor((e.clientX - rect.left) * scaleX);
  const y = Math.floor((e.clientY - rect.top) * scaleY);
  const terrain = getTerrainType(x, y);
  mouseCoordsEl.textContent = `${t("xLabel", "X")}: ${x} ${t("yLabel", "Y")}: ${y} — ${terrain}`;
});

canvas.addEventListener("mouseleave", () => {
  mouseCoordsEl.textContent = `${t("xLabel", "X")}: - ${t("yLabel", "Y")}: -`;
});
const rabbitCountEl = document.getElementById("rabbitCount");
const dayOfYearEl = document.getElementById("dayOfYear");
const rainStatusEl = document.getElementById("rainStatus");
const resetBtn = document.getElementById("resetBtn");

const TARGET_FPS = globalThis.SIM.render.targetFps;
const FRAME_MS = 1000 / TARGET_FPS;
const COUNTERS_UPDATE_MS = globalThis.SIM.render.countersUpdateMs;

let lastUpdateTime = 0;
let lastCountersUpdateTime = 0;
let lastRabbitCount = -1;

export function initWorld() {
  localizeStaticUi();
  globalThis.resetTime();
  if (typeof globalThis.resetWeather === "function") {
    globalThis.resetWeather();
  }
  if (typeof globalThis.initTerrain === "function") {
    globalThis.initTerrain();
  }
  globalThis.initRabbits();
  if (rainStatusEl) {
    rainStatusEl.textContent = t("rainNo", "Is it raining? No");
  }
  if (rabbitCountEl) {
    rabbitCountEl.textContent = `${t("rabbitCountLabel", "Rabbits")}: ${globalThis.getRabbitCount?.() ?? 0}`;
  }
  if (dayOfYearEl) {
    dayOfYearEl.textContent = `${t("dateTimeLabel", "Date")}: ${globalThis.getDateTimeString?.() ?? "2025/January/01 00:00"}`;
  }
  if (resetBtn) {
    resetBtn.textContent = t("resetButton", "Reset");
  }
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
      rabbitCountEl.textContent = `${t("rabbitCountLabel", "Rabbits")}: ${rabbitCount}`;
      lastRabbitCount = rabbitCount;
    }

    dayOfYearEl.textContent = `${t("dateTimeLabel", "Date")}: ${globalThis.getDateTimeString()}`;

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

    if (typeof globalThis.updateWeather === "function") {
      globalThis.updateWeather({ dayOfYear: globalThis.getDayOfYear() });
    }

    const rainChecker = globalThis.getCurrentWeather?.();
    const rainAmount = rainChecker ? rainChecker.rainIntensity : 0;
    const tempC = rainChecker ? rainChecker.temperatureC : 0;
    if (rainStatusEl && rainChecker) {
      rainStatusEl.textContent = rainChecker.isRaining
        ? t("rainYes", "Is it raining? Yes")
        : t("rainNo", "Is it raining? No");
    }

    if (typeof globalThis.rainAffectsTerrain === "function" && globalThis.heightMap && globalThis.heightMap.length > 0) {
      const mapHeight = globalThis.heightMap.length;
      const mapWidth = globalThis.heightMap[0].length;
      for (let i = 0; i < SAMPLE_SIZE; i++) {
        const x = Math.floor(Math.random() * mapWidth);
        const y = Math.floor(Math.random() * mapHeight);
        globalThis.rainAffectsTerrain(x, y, rainAmount);
        globalThis.temperatureAffectsTerrain(x, y, tempC);

      }
    }

    globalThis.rabbitNormalWalk();
    drawWorld(timestamp);
    lastUpdateTime = timestamp;
  }

  window.requestAnimationFrame(updateSimulation);
}
export function resetButtonHandler() {
  resetBtn.addEventListener("click", () => {
    initWorld();
  });
}

