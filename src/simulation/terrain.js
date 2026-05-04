
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

    const biomes = [
        { max: 0.30, from: [0, 0, 100],     to: [30, 80, 200]    }, // djupt → grunt vatten
        { max: 0.35, from: [210, 195, 130], to: [240, 220, 100]  }, // mörk → ljus sand
        { max: 0.55, from: [55, 24, 10],    to: [125, 82, 48]    }, // mörk → varm jord
        { max: 0.75, from: [125, 82, 48],   to: [145, 118, 92]   }, // jord → torr jord
        { max: 1.00, from: [120, 123, 128], to: [215, 218, 222]  }, // kallare gråa berg
    ];

    function lerpColor(from, to, t) {
        const r = Math.round(from[0] + (to[0] - from[0]) * t);
        const g = Math.round(from[1] + (to[1] - from[1]) * t);
        const b = Math.round(from[2] + (to[2] - from[2]) * t);
        return `rgb(${r},${g},${b})`;
    }

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const noiseValue = heightMap[y][x];

            let color = "rgb(0,0,0)";
            let prevMax = 0;
            for (const biome of biomes) {
                 if (noiseValue <= biome.max) {
                    const t = (noiseValue - prevMax) / (biome.max - prevMax);
                    color = lerpColor(biome.from, biome.to, t);
                    break;
                }
                prevMax = biome.max;
                }
            ctx.fillStyle = color;
            ctx.fillRect(x, y, 1, 1);
        }
    }
}

