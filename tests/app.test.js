import { beforeAll, test, expect, vi } from "vitest";

import "../src/simulation/simulation-constants.js";
import "../src/simulation/utils.js";
import "../src/simulation/time.js";

let initWorld;
let updateSimulation;

beforeAll(async () => {
    const app = await import("../src/simulation/app.js");
    initWorld = app.initWorld;
    updateSimulation = app.updateSimulation;
});

test("initWorld should call all the necessary functions", () => {
    const resetTimeMock = vi.fn();
    const initGrassMock = vi.fn();
    const initRabbitsMock = vi.fn();
    const worldEl = document.getElementById("world");

    globalThis.resetTime = resetTimeMock;
    globalThis.initGrass = initGrassMock;
    globalThis.initRabbits = initRabbitsMock;

    initWorld();

    expect(resetTimeMock).toHaveBeenCalledTimes(1);
    expect(initGrassMock).toHaveBeenCalledTimes(1);
    expect(initRabbitsMock).toHaveBeenCalledTimes(1);
    expect(worldEl.style.backgroundImage).toBe("none");
});

test("updateSimulation should call all the necessary functions", () => {
    const tickTimeMock = vi.fn();
    const rabbitNormalWalkMock = vi.fn();
    const rabbitEatGrassMock = vi.fn();
    const growGrassMock = vi.fn();
    const requestAnimationFrameMock = vi.fn();

    globalThis.tickTime = tickTimeMock;
    globalThis.rabbitNormalWalk = rabbitNormalWalkMock;
    globalThis.rabbitEatGrass = rabbitEatGrassMock;
    globalThis.growGrass = growGrassMock;
    window.requestAnimationFrame = requestAnimationFrameMock;

    updateSimulation(1000);
    updateSimulation(2000);

    expect(tickTimeMock).toHaveBeenCalledTimes(1);
    expect(rabbitNormalWalkMock).toHaveBeenCalledTimes(1);
    expect(rabbitEatGrassMock).toHaveBeenCalledTimes(1);
    expect(growGrassMock).toHaveBeenCalledTimes(1);
    expect(requestAnimationFrameMock).toHaveBeenCalledTimes(2);
});