
const zoomFactor = globalThis.SIM.terrain.zoomfactor;
const p5Instance = new p5((p) => { p.setup = () => p.noCanvas(); });

function initTerrain() {
    p5Instance.noiseSeed(Math.floor(Math.random() * 10000));
    globalThis.heightMap = generateHeightMap(globalThis.WIDTH, globalThis.HEIGHT);
    globalThis.drawHeightMap = drawHeightMap;
    
}
globalThis.initTerrain = initTerrain;

function generateHeightMap(width, height) {
    const heightMap = [];
    for (let y = 0; y < height; y++) {
        const row = [];
        for (let x = 0; x < width; x++) {
            const noiseValue = p5Instance.noise(x / zoomFactor, y / zoomFactor);
            row.push(noiseValue);
        }
        heightMap.push(row);
    }
    return heightMap;
}

function drawHeightMap(ctx, heightMap) {
    if (!heightMap || heightMap.length === 0) return;

    const height = heightMap.length;
    const width = heightMap[0].length;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const noiseValue = heightMap[y][x];

            let color;
            if (noiseValue < 0.3) {
                color = "rgb(0, 0, 128)";
            } else if (noiseValue < 0.35) {
                color = "rgb(240, 240, 64)";
            } else if (noiseValue < 0.7) {
                color = "rgb(139, 69, 19)";
            } else {
                color = "rgb(122, 128, 122)";
            }

            ctx.fillStyle = color;
            ctx.fillRect(x, y, 1, 1);
        }
    }
}

