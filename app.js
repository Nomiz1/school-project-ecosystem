const canvas = document.getElementById("world");
const ctx = canvas.getContext("2d");
const grassCountEl = document.getElementById("grassCount");
const resetBtn = document.getElementById("resetBtn");

const BG_COLORS = [
  [38, 7, 1],
  [47, 14, 7],
  [56, 22, 13],
];
const BG_PIXEL_SIZE = 2;

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
  initRabbit();
}

function drawWorld() {
  ctx.putImageData(backgroundImageData, 0, 0);
  drawGrass(ctx);
  drawRabbits();

  grassCountEl.textContent = `Grass: ${grass.length}`;
}

function tick() {
  growGrass();
  drawWorld();
  window.requestAnimationFrame(tick);
}

resetBtn.addEventListener("click", () => {
  initWorld();
});

initWorld();
drawWorld();
window.requestAnimationFrame(tick);
