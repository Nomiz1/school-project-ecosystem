import { beforeAll, test, expect, vi } from "vitest";

import "../src/simulation/simulation-constants.js";
import "../src/simulation/grass.js";
import "../src/simulation/utils.js";

let initGrass;
let getGrassCount;
let createGrassPatch;
let growGrass
let isGrassOverlapping;

beforeAll(async () => {
    const grassModule = await import("../src/simulation/grass.js");
    initGrass = grassModule.initGrass;
    getGrassCount = grassModule.getGrassCount;
    createGrassPatch = grassModule.createGrassPatch;
    growGrass = grassModule.growGrass;
    isGrassOverlapping = grassModule.isGrassOverlapping;
});

test ("initGrass should initialize the grass array with the correct number of patches", () => {
    const grassCount = getGrassCount();
    initGrass();
    expect(getGrassCount()).toBe(INITIAL_GRASS);
    initGrass();
    expect(getGrassCount()).toBe(INITIAL_GRASS);
});

test("createGrassPatch should return a valid grass patch object", () => {
    const patch = createGrassPatch();
    expect(patch).toHaveProperty("x");
    expect(patch).toHaveProperty("y");
    expect(patch).toHaveProperty("w");
    expect(patch).toHaveProperty("h");
    expect(patch).toHaveProperty("currentH");
    expect(patch).toHaveProperty("grown");
    expect(typeof patch.checkBiomassLevel).toBe("function");
    expect(patch.currentH).toBe(MIN_EATEN_GRASS_HEIGHT);
    expect(patch.grown).toBe(false);
    expect(patch.x).toBeGreaterThanOrEqual(0); // Check within bounds
    expect(patch.y).toBeGreaterThanOrEqual(0);
});

test("isGrassOverlapping should correctly identify overlapping patches", () => {
    const patch1 = { x: 0, y: 0, w: GRID_SIZE, h: GRID_SIZE };
    const patch2 = { x: 0, y: 0, w: GRID_SIZE, h: GRID_SIZE };
    const patch3 = { x: GRID_SIZE, y: GRID_SIZE, w: GRID_SIZE, h: GRID_SIZE };

    grass.push(patch1);
    expect(isGrassOverlapping(patch2)).toBe(true);
    expect(isGrassOverlapping(patch3)).toBe(false);
    grass.length = 0; // Clear grass array after test
});

