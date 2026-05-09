import { beforeAll, test, expect, vi } from "vitest";

import "../src/simulation/simulation-constants.js";
import "../src/simulation/utils.js";
import "../src/simulation/time.js";
import "../src/simulation/terrain.js";

let initWorld;
let updateSimulation;
let getTerrainType;

beforeAll(async () => {
    const app = await import("../src/simulation/app.js");
    initWorld = app.initWorld;
    updateSimulation = app.updateSimulation;
    getTerrainType = app.getTerrainType;
});

test("initWorld should be callable", () => {
    expect(typeof initWorld).toBe("function");
});

test("initWorld should call all the necessary functions", () => {
    const resetTimeMock = vi.fn();
    const initRabbitsMock = vi.fn();
    const worldEl = document.getElementById("world");

    globalThis.resetTime = resetTimeMock;
    globalThis.initRabbits = initRabbitsMock;

    initWorld();

    expect(resetTimeMock).toHaveBeenCalledTimes(1);
    expect(initRabbitsMock).toHaveBeenCalledTimes(1);
    expect(worldEl.style.backgroundImage).toBe("none");
});

test("updateSimulation should call all the necessary functions", () => {
    const tickTimeMock = vi.fn();
    const rabbitNormalWalkMock = vi.fn();
    const requestAnimationFrameMock = vi.fn();
    const lightGrassBecomesDarkGrassMock = vi.fn();

    globalThis.tickTime = tickTimeMock;
    globalThis.rabbitNormalWalk = rabbitNormalWalkMock;
    globalThis.lightGrassBecomesDarkGrass = lightGrassBecomesDarkGrassMock;
    window.requestAnimationFrame = requestAnimationFrameMock;

    updateSimulation(1000);
    updateSimulation(2000);

    expect(tickTimeMock).toHaveBeenCalledTimes(1);
    expect(rabbitNormalWalkMock).toHaveBeenCalledTimes(1);
    expect(lightGrassBecomesDarkGrassMock).toHaveBeenCalledTimes(200);
    expect(requestAnimationFrameMock).toHaveBeenCalledTimes(2);
});
test("getTerrainType should return correct terrain types", () => {
    globalThis.heightMap = [
        [0.1, 0.2, 0.3],
        [0.4, 0.5, 0.55, 0.6],
        [0.7, 0.8, 0.9],
    ];

    expect(getTerrainType(0, 0)).toBe("Vatten");
    expect(getTerrainType(0, 1)).toBe("Gräs");
    expect(getTerrainType(3, 1)).toBe("Torrt gräs");
});
test("getTerrainType should return '?' for out-of-bounds coordinates", () => {
    globalThis.heightMap = [
        [0.1, 0.2],
        [0.4, 0.5],
    ];

    expect(getTerrainType(-1, 0)).toBe("?");
    expect(getTerrainType(0, -1)).toBe("?");
    expect(getTerrainType(2, 0)).toBe("?");
    expect(getTerrainType(0, 2)).toBe("?");
});

test ("getTerrainType should return '?' if heightMap is not defined", () => {
    delete globalThis.heightMap;
    expect(getTerrainType(0, 0)).toBe("?");
});

