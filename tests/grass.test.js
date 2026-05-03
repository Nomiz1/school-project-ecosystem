import { beforeAll, test, expect, vi } from "vitest";

import "../src/simulation/simulation-constants.js";
import "../src/simulation/utils.js";
import "../src/simulation/grass.js";

let initGrass;
let getGrassCount;
let createGrassPatch;
let growGrass
let isGrassOverlapping;

beforeAll(async () => {
    await import("../src/simulation/grass.js");
    initGrass = globalThis.initGrass;
    getGrassCount = globalThis.getGrassCount;
    createGrassPatch = globalThis.createGrassPatch;
    growGrass = globalThis.growGrass;
    isGrassOverlapping = globalThis.isGrassOverlapping;
});

test ("initGrass should initialize the grass array with the correct number of patches", () => {
    const grassCount = getGrassCount();
    initGrass();
    expect(getGrassCount()).toBe(globalThis.SIM.grass.initialCount);
    initGrass();
    expect(getGrassCount()).toBe(globalThis.SIM.grass.initialCount);
});

test("createGrassPatch should return a valid grass patch object", () => {
    const patch = createGrassPatch();
    expect(patch).toHaveProperty("x");
    expect(patch).toHaveProperty("y");
    expect(patch).toHaveProperty("w");
    expect(patch).toHaveProperty("h");
    expect(patch).toHaveProperty("currentLevel");
    expect(patch).toHaveProperty("rawGrowth");
    expect(typeof patch.checkBiomassLevel).toBe("function");
    expect(patch.currentLevel).toBe(globalThis.SIM.grass.minGrassLevel);
    expect(patch.rawGrowth).toBe(0);
    expect(patch.x).toBeGreaterThanOrEqual(0); // Check within bounds
    expect(patch.y).toBeGreaterThanOrEqual(0);
});

test("isGrassOverlapping should correctly identify overlapping patches", () => {
    grass.length = 0; // Clear grass array before test
    const gridSize = globalThis.SIM.background.pixelSize;
    const patch1 = { x: 0, y: 0, w: gridSize, h: gridSize };
    const patch2 = { x: 0, y: 0, w: gridSize, h: gridSize };
    const patch3 = { x: gridSize, y: gridSize, w: gridSize, h: gridSize };

    grass.push(patch1);
    expect(isGrassOverlapping(patch2)).toBe(true);
    expect(isGrassOverlapping(patch3)).toBe(false);
    grass.length = 0; // Clear grass array after test
});

