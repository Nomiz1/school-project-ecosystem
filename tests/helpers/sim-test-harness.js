import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..", "..");

function createMockCanvasContext() {
  const calls = {
    putImageData: [],
    beginPath: 0,
    arc: [],
    fill: 0,
    fillRect: [],
  };

  return {
    calls,
    fillStyle: "",
    createImageData(width, height) {
      return {
        width,
        height,
        data: new Uint8ClampedArray(width * height * 4),
      };
    },
    putImageData(imageData, x, y) {
      calls.putImageData.push({ imageData, x, y });
    },
    beginPath() {
      calls.beginPath += 1;
    },
    arc(...args) {
      calls.arc.push(args);
    },
    fill() {
      calls.fill += 1;
    },
    fillRect(...args) {
      calls.fillRect.push(args);
    },
  };
}

function loadScript(context, fileName, suffix = "") {
  const absolutePath = path.join(ROOT, fileName);
  const source = fs.readFileSync(absolutePath, "utf8");
  vm.runInContext(`${source}\n${suffix}`, context, { filename: fileName });
}

function createHarness(options = {}) {
  const simOverrides = options.simOverrides || {};

  const ctx = createMockCanvasContext();
  const rafCalls = [];

  const elements = {
    world: {
      getContext() {
        return ctx;
      },
    },
    grassCount: { textContent: "" },
    rabbitCount: { textContent: "" },
    resetBtn: {
      listeners: {},
      addEventListener(type, callback) {
        this.listeners[type] = callback;
      },
    },
  };

  const context = {
    console,
    Uint8ClampedArray,
    Math: Object.create(Math),
    document: {
      getElementById(id) {
        return elements[id];
      },
    },
    window: {
      requestAnimationFrame(callback) {
        rafCalls.push(callback);
        return rafCalls.length;
      },
    },
  };

  context.globalThis = context;

  const vmContext = vm.createContext(context);

  loadScript(vmContext, "simulation-constants.js");

  vmContext.__simOverrides = simOverrides;
  vm.runInContext(
    `
(function applyOverrides(target, source) {
  if (!source || typeof source !== "object") {
    return;
  }

  for (const key of Object.keys(source)) {
    const sourceValue = source[key];
    const targetValue = target[key];

    if (
      sourceValue &&
      typeof sourceValue === "object" &&
      !Array.isArray(sourceValue) &&
      targetValue &&
      typeof targetValue === "object" &&
      !Array.isArray(targetValue)
    ) {
      applyOverrides(targetValue, sourceValue);
    } else {
      target[key] = sourceValue;
    }
  }
})(SIM, globalThis.__simOverrides);
delete globalThis.__simOverrides;
`,
    vmContext
  );

  loadScript(vmContext, "utils.js");

  return {
    context: vmContext,
    canvasContext: ctx,
    elements,
    rafCalls,
    loadScript(fileName, suffix = "") {
      loadScript(vmContext, fileName, suffix);
    },
    expose(expression) {
      return vm.runInContext(expression, vmContext);
    },
  };
}

export { createHarness };
