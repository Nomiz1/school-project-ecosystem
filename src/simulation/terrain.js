
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
    const WATER_MAX = globalThis.SIM.terrain.waterMax;
    const STEPS = globalThis.SIM.terrain.steps;
    const landBiomes = globalThis.SIM.terrain.landBiomes;

    function lerpColor(from, to, t) {
        const r = Math.round(from[0] + (to[0] - from[0]) * t);
        const g = Math.round(from[1] + (to[1] - from[1]) * t);
        const b = Math.round(from[2] + (to[2] - from[2]) * t);
        return `rgb(${r},${g},${b})`;
    }

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const raw = heightMap[y][x];

            if (raw <= WATER_MAX) {
                const t = Math.round((raw / WATER_MAX) * 6) / 6;
                ctx.fillStyle = lerpColor([8, 32, 85], [50, 105, 160], t);
            } else {
                const noiseValue = Math.round(raw * STEPS) / STEPS;
                let color = "rgb(0,0,0)";
                let prevMax = WATER_MAX;
                for (const biome of landBiomes) {
                    if (noiseValue <= biome.max) {
                        const t = (noiseValue - prevMax) / (biome.max - prevMax);
                        color = lerpColor(biome.from, biome.to, t);
                        break;
                    }
                    prevMax = biome.max;
                }
                ctx.fillStyle = color;
            }
            ctx.fillRect(x, y, 1, 1);
        }
    }
}

