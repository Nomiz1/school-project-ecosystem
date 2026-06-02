import { beforeAll, beforeEach, test, expect, vi } from "vitest";

import "../src/simulation/simulation-constants.js";
import "../src/simulation/terrain.js";
import "../src/simulation/grass.js";

function createRecordingContext() {
    const drawCalls = [];
    const ctx = {
        fillStyle: "",
        fillRect(x, y, w, h) {
            drawCalls.push({ x, y, w, h, color: this.fillStyle });
        },
    };
    return { ctx, drawCalls };
}

beforeAll(() => {
    globalThis.initTerrain();
});

beforeEach(() => {
    vi.restoreAllMocks();
});

test("drawHeightMap and redrawTerrainPixel use the same color mapping", () => {
    const WATER_MAX = globalThis.SIM.terrain.waterMax;
    const DARK_GRASS_MAX = globalThis.SIM.terrain.darkGrassMax;
    const LIGHT_GRASS_MAX = globalThis.SIM.terrain.lightGrassMax;

    const rawValues = [
        WATER_MAX / 2,
        WATER_MAX,
        (WATER_MAX + DARK_GRASS_MAX) / 2,
        (DARK_GRASS_MAX + LIGHT_GRASS_MAX) / 2,
        Math.min(LIGHT_GRASS_MAX + 0.05, 1),
    ];

    const heightMap = [rawValues];

    const full = createRecordingContext();
    globalThis.drawHeightMap(full.ctx, heightMap);

    globalThis.heightMap = heightMap;

    const singlePixelColors = [];
    for (let x = 0; x < rawValues.length; x++) {
        const one = createRecordingContext();
        globalThis.terrainCanvas = { getContext: () => one.ctx };
        globalThis.redrawTerrainPixel(x, 0);
        singlePixelColors.push(one.drawCalls[0]?.color);
    }

    const fullMapColors = full.drawCalls
        .sort((a, b) => a.x - b.x)
        .map((call) => call.color);

    expect(singlePixelColors).toEqual(fullMapColors);
});

test("lightGrassBecomesDarkGrass updates the map and redraws one pixel", () => {
    const WATER_MAX = globalThis.SIM.terrain.waterMax;
    const DARK_GRASS_MAX = globalThis.SIM.terrain.darkGrassMax;

    globalThis.heightMap = [
        [WATER_MAX - 0.01, DARK_GRASS_MAX + 0.05],
        [WATER_MAX + 0.02, WATER_MAX + 0.03],
    ];

    const redrawSpy = vi.fn();
    globalThis.redrawTerrainPixel = redrawSpy;

    globalThis.lightGrassBecomesDarkGrass(1, 0);

    expect(globalThis.heightMap[0][1]).toBeCloseTo(DARK_GRASS_MAX - 0.01);
    expect(redrawSpy).toHaveBeenCalledWith(1, 0);
    expect(redrawSpy).toHaveBeenCalledTimes(1);
});
