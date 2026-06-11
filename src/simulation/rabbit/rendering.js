import "./state.js";

function drawRabbits() {
    const ctx = globalThis.ctx;
    ctx.fillStyle = "white";

    for (const rabbit of globalThis.getRabbits()) {
        ctx.fillRect(rabbit.x, rabbit.y, rabbit.w, rabbit.h);
    }
}

Object.assign(globalThis, {
    drawRabbits,
});
