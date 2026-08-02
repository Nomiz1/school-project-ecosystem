import "./state.js";
import { agesOneFrame, fatalityCheck, growsUp } from "../mammals/aging.js";


function rabbitAgesOneFrame(rabbit) {
    agesOneFrame(rabbit, globalThis.SIM.time);
}

function rabbitFatalityCheck(rabbit) {
    return fatalityCheck(rabbit, globalThis.SIM.rabbits.firstYearMortality, globalThis.SIM.time);
}

function rabbitGrowsUp(rabbit) {
    growsUp(rabbit, globalThis.SIM.rabbits, globalThis.SIM.time);
}

Object.assign(globalThis, {
    rabbitAgesOneFrame,
    rabbitFatalityCheck,
    rabbitGrowsUp,
});