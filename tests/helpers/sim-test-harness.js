import { vi } from "vitest";
import { resetButtonHandler } from "../../src/simulation/app";

const worldCanvas = {
  width: 900,
  height: 500,
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
  addEventListener: vi.fn(),
  getBoundingClientRect: vi.fn(() => ({
    left: 0,
    top: 0,
    width: 900,
    height: 500,
  })),
  style: { backgroundImage: "none" },
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

// Minimal p5 mock used by terrain.js in tests.
globalThis.p5 = function p5Mock(sketch) {
  const state = { seed: 1 };
  const instance = {
    noCanvas: vi.fn(),
    noiseSeed: vi.fn((seed) => {
      state.seed = seed || 1;
    }),
    noise: vi.fn((x = 0, y = 0) => {
      const value = Math.sin((x + state.seed) * 12.9898 + (y + state.seed) * 78.233) * 43758.5453;
      return value - Math.floor(value);
    }),
  };

  if (typeof sketch === "function") {
    sketch(instance);
    if (typeof instance.setup === "function") {
      instance.setup();
    }
  }

  return instance;
};

resetButtonHandlerMock = vi.fn();
globalThis.resetButtonHandler = resetButtonHandlerMock;

