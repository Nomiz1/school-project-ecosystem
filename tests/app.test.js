import { beforeAll, test, expect, vi, beforeEach } from "vitest";

import "../src/simulation/simulation-constants.js";
import "../src/simulation/utils.js";
import "../src/simulation/time.js";
import "../src/simulation/terrain.js";

let initWorld;
let updateSimulation;
let getTerrainType;
let resetButtonHandler;


beforeAll(async () => {
    const app = await import("../src/simulation/app.js");
    initWorld = app.initWorld;
    updateSimulation = app.updateSimulation;
    getTerrainType = app.getTerrainType;
    resetButtonHandler = app.resetButtonHandler;
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

test("initWorld should initialize terrain if initTerrain is defined", () => {
    globalThis.initTerrain = vi.fn();
    globalThis.resetTime = vi.fn();
    globalThis.initRabbits = vi.fn();

    initWorld();

    expect(globalThis.initTerrain).toHaveBeenCalledTimes(1);
    expect(globalThis.resetTime).toHaveBeenCalledTimes(1);
    expect(globalThis.initRabbits).toHaveBeenCalledTimes(1);
});

test("initWorld does not throw when initTerrain is missing", () => {
    delete globalThis.initTerrain;
    globalThis.resetTime = vi.fn();
    globalThis.initRabbits = vi.fn();

    expect(() => initWorld()).not.toThrow();
    expect(globalThis.resetTime).toHaveBeenCalledTimes(1);
    expect(globalThis.initRabbits).toHaveBeenCalledTimes(1);
});

test("initWorld resets simulation timing state", () => {
    const tickTimeMock = vi.fn();
    const requestAnimationFrameMock = vi.fn();
    const rabbitNormalWalkMock = vi.fn();
    const lightGrassBecomesDarkGrassMock = vi.fn();

    globalThis.tickTime = tickTimeMock;
    globalThis.rabbitNormalWalk = rabbitNormalWalkMock;
    globalThis.lightGrassBecomesDarkGrass = lightGrassBecomesDarkGrassMock;
    window.requestAnimationFrame = requestAnimationFrameMock;


    updateSimulation(1000);
    updateSimulation(2000);

    initWorld();

    tickTimeMock.mockClear();
    rabbitNormalWalkMock.mockClear();
    lightGrassBecomesDarkGrassMock.mockClear();
    requestAnimationFrameMock.mockClear();

    updateSimulation(3000);

    expect(tickTimeMock).toHaveBeenCalledTimes(0);
    expect(rabbitNormalWalkMock).toHaveBeenCalledTimes(0);
    expect(lightGrassBecomesDarkGrassMock).toHaveBeenCalledTimes(globalThis.SIM.terrain.sampleSize);
    expect(requestAnimationFrameMock).toHaveBeenCalledTimes(1);


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

    initWorld();

    updateSimulation(1000);
    updateSimulation(2000);

    expect(tickTimeMock).toHaveBeenCalledTimes(1);
    expect(rabbitNormalWalkMock).toHaveBeenCalledTimes(1);
    expect(lightGrassBecomesDarkGrassMock).toHaveBeenCalledTimes(globalThis.SIM.terrain.sampleSize * 2);
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

test("getTerrainType should return '?' if heightMap is not defined", () => {
    delete globalThis.heightMap;
    expect(getTerrainType(0, 0)).toBe("?");
});

test("resetButtonHandler should call initWorld when reset button is clicked", () => {
    const getElementByIdMock = document.getElementById;
    const resetBtnCallIndex = getElementByIdMock.mock.calls.findIndex(([id]) => id === "resetBtn");
    const resetBtn = getElementByIdMock.mock.results[resetBtnCallIndex]?.value;

    expect(resetBtn).toBeDefined();

    globalThis.resetTime = vi.fn();
    globalThis.initTerrain = vi.fn();
    globalThis.initRabbits = vi.fn();

    resetBtn.addEventListener.mockClear();

    resetButtonHandler();

    expect(resetBtn.addEventListener).toHaveBeenCalledWith("click", expect.any(Function));

    const clickHandler = resetBtn.addEventListener.mock.calls.at(-1)[1];
    clickHandler();

    expect(globalThis.resetTime).toHaveBeenCalledTimes(1);
    expect(globalThis.initTerrain).toHaveBeenCalledTimes(1);
    expect(globalThis.initRabbits).toHaveBeenCalledTimes(1);
});

test("mouse move event should update mouse coordinates and terrain type", () => {
    const getElementByIdMock = document.getElementById;

    const worldCallIndex = getElementByIdMock.mock.calls.findIndex(([id]) => id === "world");
    const worldCanvas = getElementByIdMock.mock.results[worldCallIndex]?.value;

    const mouseCoordsCallIndex = getElementByIdMock.mock.calls.findIndex(([id]) => id === "mouseCoords");
    const mouseCoordsEl = getElementByIdMock.mock.results[mouseCoordsCallIndex]?.value;

    expect(worldCanvas).toBeDefined();
    expect(mouseCoordsEl).toBeDefined();

    worldCanvas.getBoundingClientRect = vi.fn(() => ({
        left: 0,
        top: 0,
        width: 900,
        height: 500,
    }));

    const mouseMoveHandler = worldCanvas.addEventListener.mock.calls.find(
        ([event]) => event === "mousemove"
    )?.[1];

    expect(mouseMoveHandler).toBeTypeOf("function");

    globalThis.heightMap = [[0.1]];
    mouseMoveHandler({ clientX: 0, clientY: 0 });

    expect(worldCanvas.getBoundingClientRect).toHaveBeenCalledTimes(1);
    expect(mouseCoordsEl.textContent).toBe("X: 0 Y: 0 — Vatten");
});

test("drawWorld should update after countersUpdateMs and skip unchanged rabbit count", () => {
    const getElementByIdMock = document.getElementById;
    function getImportedElementById(id) {
        const callIndex = getElementByIdMock.mock.calls.findIndex(([calledId]) => calledId === id);
        expect(callIndex).toBeGreaterThan(-1);
        return getElementByIdMock.mock.results[callIndex]?.value;
    }

    const rabbitCountEl = getImportedElementById("rabbitCount");
    const timeOfDayEl = getImportedElementById("timeOfDay");
    const dayOfYearEl = getImportedElementById("dayOfYear");

    expect(rabbitCountEl).toBeDefined();
    expect(timeOfDayEl).toBeDefined();
    expect(dayOfYearEl).toBeDefined();

    const getRabbitCountMock = vi
        .fn()
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0);
    const getClockStringMock = vi
        .fn()
        .mockReturnValueOnce("00:00")
        .mockReturnValueOnce("01:00");
    const getDayOfYearStringMock = vi
        .fn()
        .mockReturnValueOnce("1 Jan")
        .mockReturnValueOnce("2 Jan");

    globalThis.getRabbitCount = getRabbitCountMock;
    globalThis.getClockString = getClockStringMock;
    globalThis.getDayOfYearString = getDayOfYearStringMock;

    initWorld();

    expect(rabbitCountEl.textContent).toBe("Rabbits: 0");
    expect(timeOfDayEl.textContent).toBe("Time: 00:00");
    expect(dayOfYearEl.textContent).toBe("Day: 1 Jan");

    let rabbitWrites = 0;
    let rabbitValue = rabbitCountEl.textContent;

    Object.defineProperty(rabbitCountEl, "textContent", {
        get() {
            return rabbitValue;
        },
        set(value) {
            rabbitWrites += 1;
            rabbitValue = value;
        },
        configurable: true,
    });

    const frameMs = 1000 / globalThis.SIM.render.targetFps;
    const countersMs = globalThis.SIM.render.countersUpdateMs;

    const tickTimeMock = vi.fn();
    const rabbitNormalWalkMock = vi.fn();
    const drawRabbitsMock = vi.fn();
    const lightGrassBecomesDarkGrassMock = vi.fn();
    const requestAnimationFrameMock = vi.fn();

    globalThis.tickTime = tickTimeMock;
    globalThis.rabbitNormalWalk = rabbitNormalWalkMock;
    globalThis.drawRabbits = drawRabbitsMock;
    globalThis.lightGrassBecomesDarkGrass = lightGrassBecomesDarkGrassMock;
    window.requestAnimationFrame = requestAnimationFrameMock;

    updateSimulation(0);
    updateSimulation(frameMs);

    expect(rabbitWrites).toBe(0);

    updateSimulation(countersMs + frameMs + 1);

    expect(rabbitWrites).toBe(1);
    expect(rabbitCountEl.textContent).toBe("Rabbits: 0");
    expect(timeOfDayEl.textContent).toBe("Time: 00:00");
    expect(dayOfYearEl.textContent).toBe("Day: 1 Jan");

    updateSimulation((2 * countersMs) + frameMs + 2);

    expect(rabbitWrites).toBe(1);
    expect(rabbitCountEl.textContent).toBe("Rabbits: 0");
    expect(timeOfDayEl.textContent).toBe("Time: 01:00");
    expect(dayOfYearEl.textContent).toBe("Day: 2 Jan");
});