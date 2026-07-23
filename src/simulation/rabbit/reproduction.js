import "./state.js";
import "../time.js";
import { mammalReproduction } from "../mammals/reproduction.js";

function getRabbitReproductionConfig() {
    return {
        ...globalThis.SIM.mammals.reproduction,
        ...globalThis.SIM.rabbits.reproduction,
    };
}

function rabbitReproduction() {
    const rabbits = globalThis.getRabbits();
    const rabbitReproductionConfig = getRabbitReproductionConfig();
    const reproductionConfig = {
        gestationPeriodFrames: rabbitReproductionConfig.gestationPeriodFrames,
        litterSizeMin: rabbitReproductionConfig.litterSizeMin,
        litterSizeMax: rabbitReproductionConfig.litterSizeMax,
    };

    return mammalReproduction(
        rabbits,
        globalThis.getMonthOfYear(),
        globalThis.getSimulationYearIndex(),
        reproductionConfig
    );
}

function createBabyRabbit(parentRabbit) {
    const rabbitReproductionConfig = getRabbitReproductionConfig();
    const height = globalThis.SIM.rabbits.babyheight;
    const width = globalThis.SIM.rabbits.babywidth;
    const speedMin = Number.isFinite(parentRabbit?.pregnancySpeedMin)
        ? parentRabbit.pregnancySpeedMin
        : parentRabbit.speed;
    const speedMax = Number.isFinite(parentRabbit?.pregnancySpeedMax)
        ? parentRabbit.pregnancySpeedMax
        : parentRabbit.speed;

    return {
        x: Math.max(
            0,
            Math.min(
                globalThis.rabbitWorldWidth - width,
                (parentRabbit?.x ?? 0) + globalThis.rabbitRandomBetween(-1, 1)
            )
        ),
        y: Math.max(
            0,
            Math.min(
                globalThis.rabbitWorldHeight - height,
                (parentRabbit?.y ?? 0) + globalThis.rabbitRandomBetween(-1, 1)
            )
        ),
        w: globalThis.SIM.rabbits.babywidth,
        h: globalThis.SIM.rabbits.babyheight,
        speed: globalThis.randomFloat(speedMin, speedMax),
        angle: globalThis.rabbitRandomBetween(0, 359),
        hunger: globalThis.SIM.rabbits.hungerMax,
        age: 0,
        mature: false,
        gender: Math.random() < 0.5 ? "male" : "female",
        pregnant: false,
        maxTimesPregnantPerYear: globalThis.rabbitRandomBetween(
            rabbitReproductionConfig.maxTimesPregnantPerYearMin,
            rabbitReproductionConfig.maxTimesPregnantPerYearMax
        ),
        timesPregnantThisYear: 0,
        pregnancyYearIndex: globalThis.getSimulationYearIndex(),
    };
}

function rabbitBirth() {
    const rabbits = globalThis.getRabbits();
    const newbornRabbits = [];

    for (const rabbit of rabbits) {
        if (!rabbit.pregnant) continue;

        rabbit.pregnancyTimer -= 1;
        if (rabbit.pregnancyTimer <= 0) {
            rabbit.pregnant = false;
            rabbit.pregnancyTimer = 0;

            const litterSize = Number.isFinite(rabbit.pregnancyLitterSize)
                ? rabbit.pregnancyLitterSize
                : 1;

            for (let i = 0; i < litterSize; i++) {
                newbornRabbits.push(createBabyRabbit(rabbit));
            }

            rabbit.pregnancyLitterSize = 0;
        }
    }

    if (newbornRabbits.length > 0) {
        rabbits.push(...newbornRabbits);
    }
}

Object.assign(globalThis, {
    rabbitReproduction,
    rabbitBirth,
    createBabyRabbit,
});