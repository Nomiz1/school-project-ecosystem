import "./state.js";
import "../time.js";
import { mammalReproduction, createBabyMammal, mammalBirth } from "../mammals/reproduction.js";

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
    const currentYearIndex = globalThis.getSimulationYearIndex();
    const birthConfig = {
        world: globalThis.SIM.world,
        hungerMax: globalThis.SIM.rabbits.hungerMax,
        reproduction: {
            maxTimesPregnantPerYearMin: rabbitReproductionConfig.maxTimesPregnantPerYearMin,
            maxTimesPregnantPerYearMax: rabbitReproductionConfig.maxTimesPregnantPerYearMax,
        },
    };

    return createBabyMammal(
        parentRabbit,
        globalThis.SIM.rabbits.babywidth,
        globalThis.SIM.rabbits.babyheight,
        birthConfig,
        currentYearIndex
    );
}

function rabbitBirth() {
    const rabbits = globalThis.getRabbits();
    mammalBirth(rabbits, createBabyRabbit);
}

Object.assign(globalThis, {
    rabbitReproduction,
    rabbitBirth,
    createBabyRabbit,
});