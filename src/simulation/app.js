const canvas = document.getElementById("world");
const ctx = canvas.getContext("2d");
globalThis.ctx = ctx;
const grassCountEl = document.getElementById("grassCount");
const rabbitCountEl = document.getElementById("rabbitCount");
const resetBtn = document.getElementById("resetBtn");

const BG_COLORS = globalThis.SIM.background.colors;
const BG_PIXEL_SIZE = globalThis.SIM.background.pixelSize;

let backgroundImageData = null;

function initBackground() {
  const imageData = ctx.createImageData(globalThis.WIDTH, globalThis.HEIGHT);

  for (let blockY = 0; blockY < globalThis.HEIGHT; blockY += BG_PIXEL_SIZE) {
    for (let blockX = 0; blockX < globalThis.WIDTH; blockX += BG_PIXEL_SIZE) {
      const [r, g, b] = BG_COLORS[globalThis.randomInt(0, BG_COLORS.length - 1)];

      for (let py = 0; py < BG_PIXEL_SIZE && blockY + py < globalThis.HEIGHT; py += 1) {
        for (let px = 0; px < BG_PIXEL_SIZE && blockX + px < globalThis.WIDTH; px += 1) {
          const index = ((blockY + py) * globalThis.WIDTH + (blockX + px)) * 4;
          imageData.data[index] = r;
          imageData.data[index + 1] = g;
          imageData.data[index + 2] = b;
          imageData.data[index + 3] = 255;
        }
      }
    }
  }

  backgroundImageData = imageData;
}

function initWorld() {
  globalThis.initGrass();
  initBackground();
  globalThis.initRabbits();
}

function drawWorld() {
  ctx.putImageData(backgroundImageData, 0, 0);
  globalThis.drawGrass(ctx);
  globalThis.drawRabbits();

  grassCountEl.textContent = `Grass: ${globalThis.getGrassCount()}`;
  rabbitCountEl.textContent = `Rabbits: ${globalThis.getRabbitCount()}`;
}

function updateSimulation() {
  globalThis.rabbitNormalWalk();
  globalThis.rabbitEatGrass();
  globalThis.growGrass();
  drawWorld();
  window.requestAnimationFrame(updateSimulation);
}

resetBtn.addEventListener("click", () => {
  initWorld();
});

initWorld();
drawWorld();
window.requestAnimationFrame(updateSimulation);
