const canvas = document.getElementById("world");
const ctx = canvas.getContext("2d");
const grassCountEl = document.getElementById("grassCount");
const rabbitCountEl = document.getElementById("rabbitCount");
const resetBtn = document.getElementById("resetBtn");

const BG_COLORS = SIM.background.colors;
const BG_PIXEL_SIZE = SIM.background.pixelSize;

let backgroundImageData = null;

function initBackground() {
  const imageData = ctx.createImageData(WIDTH, HEIGHT);

  for (let blockY = 0; blockY < HEIGHT; blockY += BG_PIXEL_SIZE) {
    for (let blockX = 0; blockX < WIDTH; blockX += BG_PIXEL_SIZE) {
      const [r, g, b] = BG_COLORS[randomInt(0, BG_COLORS.length - 1)];

      for (let py = 0; py < BG_PIXEL_SIZE && blockY + py < HEIGHT; py += 1) {
        for (let px = 0; px < BG_PIXEL_SIZE && blockX + px < WIDTH; px += 1) {
          const index = ((blockY + py) * WIDTH + (blockX + px)) * 4;
          imageData.data[index]     = r;
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
  initGrass();
  initBackground();
  initRabbits();
}

function drawWorld() {
  ctx.putImageData(backgroundImageData, 0, 0);
  drawGrass(ctx);
  drawRabbits();

  grassCountEl.textContent = `Grass: ${getGrassCount()}`;
  rabbitCountEl.textContent = `Rabbits: ${getRabbitCount()}`;
}

function updateSimulation() {
  rabbitNormalWalk();
  rabbitEatGrass();
  growGrass();
  drawWorld();
  window.requestAnimationFrame(updateSimulation);
}

resetBtn.addEventListener("click", () => {
  initWorld();
});

initWorld();
drawWorld();
window.requestAnimationFrame(updateSimulation);
