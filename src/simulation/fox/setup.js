import "./state.js";
import { initMammals } from "../mammals/setup.js";

function initFoxes() {
    initMammals(
        globalThis.getFoxes,
        globalThis.setFoxes,
        globalThis.INITIAL_FOXES,
        createFox
    );
}

function getFoxCount() {
    return globalThis.getFoxes().length;
}

function createFox() {
    const foxReproductionConfig = globalThis.SIM.foxes.reproduction;
    const height = globalThis.SIM.foxes.height;
    const width = globalThis.SIM.foxes.width;
    const speed = globalThis.randomInt(globalThis.SIM.foxes.speedMin, globalThis.SIM.foxes.speedMax);

    return {
        x: globalThis.randomInt(0, globalThis.SIM.world.width - width),
        y: globalThis.randomInt(0, globalThis.SIM.world.height - height),
        w: width,
        h: height,
        speed: speed,
        angle: globalThis.randomInt(0, 359),
        hunger: globalThis.SIM.foxes.hungerMax,
        age: 0,
        mature: false,
        gender: Math.random() < 0.5 ? "male" : "female",
        pregnant: false,
        maxTimesPregnantPerYear: globalThis.randomInt(
            foxReproductionConfig.maxTimesPregnantPerYearMin,
            foxReproductionConfig.maxTimesPregnantPerYearMax
        ),
    };
}

Object.assign(globalThis, {
    initFoxes,
    getFoxCount,
    createFox,
});