const canvas = document.getElementById("world");
const ctx = canvas.getContext("2d");
const grassCountEl = document.getElementById("grassCount");
const resetBtn = document.getElementById("resetBtn");

function initWorld() {
  initGrass();
  initRabbits();
}

function drawWorld() {
  ctx.fillStyle = "rgb(150, 75, 0)";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  drawGrass(ctx);
  drawRabbits(ctx);
  grassCountEl.textContent = `Grass: ${grass.length}`;
}

function tick() {
  growGrass();
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
