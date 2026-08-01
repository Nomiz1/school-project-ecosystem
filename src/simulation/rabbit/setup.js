import "./state.js";
import { initMammals } from "../mammals/setup.js";

function initRabbits() {
    initMammals(
        globalThis.getRabbits,
        globalThis.setRabbits,
        globalThis.INITIAL_RABBITS,
        createRabbit
    );
}

function getRabbitCount() {
    return globalThis.getRabbits().length;
}

function createRabbit() {
    const rabbitReproductionConfig = globalThis.SIM.rabbits.reproduction;
    const height = globalThis.SIM.rabbits.height;
    const width = globalThis.SIM.rabbits.width;
    const speed = globalThis.randomInt(globalThis.SIM.rabbits.speedMin, globalThis.SIM.rabbits.speedMax);

    return {
        x: globalThis.randomInt(0, globalThis.SIM.world.width - width),
        y: globalThis.randomInt(0, globalThis.SIM.world.height - height),
        w: width,
        h: height,
        speed: speed,
        angle: globalThis.randomInt(0, 359),
        hunger: globalThis.SIM.rabbits.hungerMax,
        age: 0,
        mature: false,
        gender: Math.random() < 0.5 ? "male" : "female",
        pregnant: false,
        maxTimesPregnantPerYear: globalThis.randomInt(
            rabbitReproductionConfig.maxTimesPregnantPerYearMin,
            rabbitReproductionConfig.maxTimesPregnantPerYearMax
        ),
    };
}

Object.assign(globalThis, {
    initRabbits,
    getRabbitCount,
    createRabbit,
});
