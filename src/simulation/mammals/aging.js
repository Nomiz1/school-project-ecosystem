
export function agesOneFrame(mammal, timeConfig) {
    const framesPerDay = timeConfig.framesPerDay;
    const daysPerYear = 365;
    mammal.age += 1 / (framesPerDay * daysPerYear);
}

export function fatalityCheck(mammal, mortalityConfig, timeConfig) {
    const A = mortalityConfig.makehamBaselineMortality;
    const B = mortalityConfig.gompertzInitialMortality;
    const C = mortalityConfig.gompertzAgingRate;
    const daysPerYear = 365;
    const framesPerDay = timeConfig.framesPerDay;

    const hazardPerYear = A + B * Math.exp(C * mammal.age);
    const hazardPerFrame = hazardPerYear / (daysPerYear * framesPerDay);
    const deathProbability = 1 - Math.exp(-hazardPerFrame);

    return Math.random() < deathProbability;
}

export function growsUp(mammal, speciesConfig, timeConfig) {
    const matureAgeYears = speciesConfig.matureAge / (timeConfig.framesPerDay * 365);
    if (!mammal.mature && mammal.age >= matureAgeYears) {
        mammal.mature = true;
        mammal.w = speciesConfig.width;
        mammal.h = speciesConfig.height;
    }
}
