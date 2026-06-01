import { beforeAll, test, expect, vi, beforeEach } from "vitest";

import "../src/simulation/simulation-constants.js";
import "../src/simulation/utils.js";
import "../src/simulation/time.js";
import "../src/simulation/terrain.js";

let initWorld;
let updateSimulation;
let getTerrainType;
let resetButtonHandler;

function getLanguage() {
    const locale = (globalThis.SIM?.i18n?.locale || "sv-SE").toLowerCase();
    return locale.split("-")[0];
}

function getTexts() {
    const language = getLanguage();
    const texts = globalThis.SIM?.i18n?.texts || {};
    return texts[language] || texts.en || {};
}


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
    const texts = getTexts();
    globalThis.heightMap = [
        [0.1, 0.2, 0.3],
        [0.4, 0.5, 0.55, 0.6],
        [0.7, 0.8, 0.9],
    ];

    expect(getTerrainType(0, 0)).toBe(texts.terrainWater);
    expect(getTerrainType(0, 1)).toBe(texts.terrainGrass);
    expect(getTerrainType(3, 1)).toBe(texts.terrainDryGrass);
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
    const texts = getTexts();
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
    expect(mouseCoordsEl.textContent).toBe(`${texts.xLabel}: 0 ${texts.yLabel}: 0 — ${texts.terrainWater}`);
});

test("drawWorld should update after countersUpdateMs and skip unchanged rabbit count", () => {
    const texts = getTexts();
    const getElementByIdMock = document.getElementById;
    function getImportedElementById(id) {
        const callIndex = getElementByIdMock.mock.calls.findIndex(([calledId]) => calledId === id);
        expect(callIndex).toBeGreaterThan(-1);
        return getElementByIdMock.mock.results[callIndex]?.value;
    }

    const rabbitCountEl = getImportedElementById("rabbitCount");
    const dayOfYearEl = getImportedElementById("dayOfYear");

    expect(rabbitCountEl).toBeDefined();
    expect(dayOfYearEl).toBeDefined();

    const getRabbitCountMock = vi
        .fn()
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0);
    const getDateTimeStringMock = vi
        .fn()
        .mockReturnValueOnce("2025/January/01 00:00")
        .mockReturnValueOnce("2025/January/01 00:00")
        .mockReturnValueOnce("2025/January/02 01:00");

    globalThis.getRabbitCount = getRabbitCountMock;
    globalThis.getDateTimeString = getDateTimeStringMock;

    initWorld();

    expect(rabbitCountEl.textContent).toBe(`${texts.rabbitCountLabel}: 0`);
    expect(dayOfYearEl.textContent).toBe(`${texts.dateTimeLabel}: 2025/January/01 00:00`);

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
    expect(rabbitCountEl.textContent).toBe(`${texts.rabbitCountLabel}: 0`);
    expect(dayOfYearEl.textContent).toBe(`${texts.dateTimeLabel}: 2025/January/01 00:00`);

    updateSimulation((2 * countersMs) + frameMs + 2);

    expect(rabbitWrites).toBe(1);
    expect(rabbitCountEl.textContent).toBe(`${texts.rabbitCountLabel}: 0`);
    expect(dayOfYearEl.textContent).toBe(`${texts.dateTimeLabel}: 2025/January/02 01:00`);
});