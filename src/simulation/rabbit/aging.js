import "./state.js";
import { agesOneFrame, fatalityCheck, growsUp } from "../mammals/aging.js";


function rabbitAgesOneFrame(rabbit) {
    agesOneFrame(rabbit, globalThis.SIM.time);
}

function getRabbitMortalityConfig(rabbit) {
    if (rabbit.age < 1) {
        return globalThis.SIM.rabbits.firstYearMortality;
    }

    return globalThis.SIM.rabbits.adultMortality;
}

function rabbitFatalityCheck(rabbit) {
    return fatalityCheck(rabbit, getRabbitMortalityConfig(rabbit), globalThis.SIM.time);
}

function rabbitGrowsUp(rabbit) {
    growsUp(rabbit, globalThis.SIM.rabbits, globalThis.SIM.time);
}

Object.assign(globalThis, {
    rabbitAgesOneFrame,
    rabbitFatalityCheck,
    rabbitGrowsUp,
});