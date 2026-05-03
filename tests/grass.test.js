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