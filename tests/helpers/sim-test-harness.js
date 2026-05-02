import { vi } from "vitest";

const worldCanvas = {
  getContext: vi.fn(() => ({
    clearRect: vi.fn(),
    drawImage: vi.fn(),
    fillRect: vi.fn(),
    fillStyle: "",
    save: vi.fn(),
    restore: vi.fn(),
    lineTo: vi.fn(),
    moveTo: vi.fn(),
    stroke: vi.fn(),
    beginPath: vi.fn(),
  })),
  style: {},
};

// Mock DOM objects
global.document = {
    getElementById: vi.fn((id) => {
        if (id === "world") return worldCanvas;
        return { textContent: "", addEventListener: vi.fn() };
    }),
    createElement: vi.fn(() => ({
        width: 0,
        height: 0,
        style: {},
        getContext: vi.fn(() => ({
            fillRect: vi.fn(),
            fillStyle: "",
            clearRect: vi.fn(),
            drawImage: vi.fn(),
            save: vi.fn(),
            restore: vi.fn(),
        })),
    })),
};

// Stub globals needed when app.js loads at import time
globalThis.resetTime = () => { };
globalThis.initGrass = () => { };
globalThis.initRabbits = () => { };
globalThis.drawDayNightOverlay = () => { };
globalThis.drawGrass = () => { };
globalThis.drawRabbits = () => { };
globalThis.getGrassCount = () => 0;
globalThis.getRabbitCount = () => 0;
globalThis.getClockString = () => "00:00";
globalThis.getDayOfYearString = () => "1 Jan";
globalThis.tickTime = () => { };
globalThis.rabbitNormalWalk = () => { };
globalThis.rabbitEatGrass = () => { };
globalThis.growGrass = () => { };