import "./state.js";

function rabbitAgesOneFrame(rabbit) {
    const framesPerDay = globalThis.SIM.time.framesPerDay;
    const daysPerYear = 365;
    rabbit.age += 1 / (framesPerDay * daysPerYear);
}

function rabbitFatalityCheck(rabbit) {
    const A = globalThis.SIM.rabbits.makehamBaselineMortality;
    const B = globalThis.SIM.rabbits.gompertzInitialMortality;
    const C = globalThis.SIM.rabbits.gompertzAgingRate;
    const daysPerYear = 365;
    const framesPerDay = globalThis.SIM.time.framesPerDay;

    const hazardPerYear = A + B * Math.exp(C * rabbit.age);
    const hazardPerFrame = hazardPerYear / (daysPerYear * framesPerDay);
    const deathProbability = 1 - Math.exp(-hazardPerFrame);

    return Math.random() < deathProbability;
}

function rabbitGrowsUp(rabbit) {
    const matureAgeYears = globalThis.SIM.rabbits.matureAge / (globalThis.SIM.time.framesPerDay * 365);
    if (!rabbit.mature && rabbit.age >= matureAgeYears) {
        rabbit.mature = true;
        rabbit.w = globalThis.SIM.rabbits.width;
        rabbit.h = globalThis.SIM.rabbits.height;
    }
}

Object.assign(globalThis, {
    rabbitAgesOneFrame,
    rabbitFatalityCheck,
    rabbitGrowsUp,
});