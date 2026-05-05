
const zoomFactor = globalThis.SIM.terrain.zoomfactor;
const p5Instance = new p5((p) => { p.setup = () => p.noCanvas(); });

function initTerrain() {
    p5Instance.noiseSeed(Math.floor(Math.random() * 10000));
    globalThis.heightMap = generateHeightMap(globalThis.WIDTH, globalThis.HEIGHT);

    // Render terrain once into an offscreen canvas so it can be drawn cheaply each frame.
    const offscreen = document.createElement("canvas");
    offscreen.width = globalThis.WIDTH;
    offscreen.height = globalThis.HEIGHT;
    drawHeightMap(offscreen.getContext("2d"), globalThis.heightMap);
    globalThis.terrainCanvas = offscreen;

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
    const DARK_GRASS_MAX = globalThis.SIM.terrain.darkGrassMax;
    const LIGHT_GRASS_MAX = globalThis.SIM.terrain.lightGrassMax;

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
                if (noiseValue <= DARK_GRASS_MAX) {
                    const t = (noiseValue - WATER_MAX) / (DARK_GRASS_MAX - WATER_MAX);
                    color = lerpColor([32, 55, 33], [76, 95, 55], t);
                } else if (noiseValue <= LIGHT_GRASS_MAX) {
                    const t = (noiseValue - DARK_GRASS_MAX) / (LIGHT_GRASS_MAX - DARK_GRASS_MAX);
                    color = lerpColor([76, 100, 55], [122, 110, 80], t);
                }
                ctx.fillStyle = color;
            }
            ctx.fillRect(x, y, 1, 1);
        }
    }
}

function redrawTerrainPixel(x, y) {
    const ctx = globalThis.terrainCanvas.getContext('2d');
    const raw = globalThis.heightMap[y][x];
    const WATER_MAX = globalThis.SIM.terrain.waterMax;
    const STEPS = globalThis.SIM.terrain.steps;
    const DARK_GRASS_MAX = globalThis.SIM.terrain.darkGrassMax;
    const LIGHT_GRASS_MAX = globalThis.SIM.terrain.lightGrassMax;

    function lerpColor(from, to, t) {
        const r = Math.round(from[0] + (to[0] - from[0]) * t);
        const g = Math.round(from[1] + (to[1] - from[1]) * t);
        const b = Math.round(from[2] + (to[2] - from[2]) * t);
        return `rgb(${r},${g},${b})`;
    }

    if (raw <= WATER_MAX) {
        const t = Math.round((raw / WATER_MAX) * 6) / 6;
        ctx.fillStyle = lerpColor([8, 32, 85], [50, 105, 160], t);
    } else {
        const noiseValue = Math.round(raw * STEPS) / STEPS;
        let color = 'rgb(0,0,0)';
        if (noiseValue <= DARK_GRASS_MAX) {
            const t = (noiseValue - WATER_MAX) / (DARK_GRASS_MAX - WATER_MAX);
            color = lerpColor([32, 55, 33], [76, 95, 55], t);
        } else if (noiseValue <= LIGHT_GRASS_MAX) {
            const t = (noiseValue - DARK_GRASS_MAX) / (LIGHT_GRASS_MAX - DARK_GRASS_MAX);
            color = lerpColor([76, 100, 55], [122, 110, 80], t);
        }
        ctx.fillStyle = color;
    }
    ctx.fillRect(x, y, 1, 1);
}
globalThis.redrawTerrainPixel = redrawTerrainPixel;

