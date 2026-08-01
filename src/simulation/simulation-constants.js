import { browserLocale, i18nTexts } from "./language.js";

const world = {
    width: 800,
    height: 800,
};

const SIM = {
    world,
    terrain: {
        zoomfactor: 200, // Controls the scale of the Perlin noise for terrain generation
        waterMax: 0.30,
        darkGrassMax: 0.55,
        lightGrassMax: 1.00,
        grassNearWater: 20,
        sampleSize: 200
    },
    movement: {
        world,
        waterMax: 0.30,
    },
    render: {
        targetFps: 60,
        countersUpdateMs: 250,
    },
    time: {
        framesPerDay: 48,
    },
    i18n: {
        locale: browserLocale,
        texts: i18nTexts,
    },
    // All the values in the following section are fillers that will be overridden by spific spieces values in their respective files (e.g., src/simulation/rabbit/state.js)
    mammals: {
        witdh: 4,
        height: 4,
        babywidth: 2,
        babyheight: 2,
        speedMin: 1,
        speedMax: 3,
        eatChance: 0.5,
        hungerMax: 100,
        eatHungerGain: 10,
        hungerLossPerFrame: 0.1,
        mortality: {
            makehamBaselineMortality: 0.8,
            gompertzInitialMortality: 0.4,
            gompertzAgingRate: 0.7, 
        },
        reproduction: {
            gestationPeriodFrames: 1440,
            litterSizeMin: 2,
            litterSizeMax: 4,
            maxTimesPregnantPerYearMin: 1,
            maxTimesPregnantPerYearMax: 3,
        },
        matureAge: 10,
    },
    rabbits: {
        initialCount: 100,
        width: 2,
        height: 2,
        babywidth: 1,
        babyheight: 1,
        speedMin: 1,
        speedMax: 3,
        eatChance: 0.5,
        hungerMax: 100,
        eatHungerGain: 10,
        rabbitAffectEatenGrassFactor: 0.05,
        hungerLossPerFrame: 0.1,
        mortality: {
            makehamBaselineMortality: 1.5,
            gompertzInitialMortality: 0.6186,
            gompertzAgingRate: 0.5,
        },
        reproduction: {
            gestationPeriodFrames: 1440, // 30 days in frames (48 frames/day * 30 days)
            litterSizeMin: 4,
            litterSizeMax: 6,
            maxTimesPregnantPerYearMin: 3,
            maxTimesPregnantPerYearMax: 5,
        },
        matureAge: 5040, // 3.5 months in frames (48 frames/day * 30 days/month * 3.5 months)
    },
    foxes: {
        initialCount: 20,
        width: 3,
        height: 3,
        babywidth: 2,
        babyheight: 2,
        speedMin: 1,
        speedMax: 4,
        eatChance: 0.7,
        hungerMax: 100,
        eatHungerGain: 20,
        hungerLossPerFrame: 0.15,
        mortality: {
            makehamBaselineMortality: 1.2,
            gompertzInitialMortality: 0.5,
            gompertzAgingRate: 0.6, 
        },
        reproduction: {
            gestationPeriodFrames: 1440, // 30 days in frames (48 frames/day * 30 days)
            litterSizeMin: 2,
            litterSizeMax: 5,
            maxTimesPregnantPerYearMin: 1,
            maxTimesPregnantPerYearMax: 3,
        },
        matureAge: 7200, // 5 months in frames (48 frames/day * 30 days/month * 5 months)
    },
    weather: {
        intensityBurstAllowance: 1.4,
        lightRainMaxMm: 6.0,
        middleRainMaxMm: 13.0,
        darkRainMaxMm: 20.0,
        smoothTempTransitionFactor: 0.15,
        rainTempCoolingEffect: 0.8,
    },
    background: {
        pixelSize: 8,
        colors: [
            "rgb(38, 7, 1)",
            "rgb(47, 14, 7)",
            "rgb(56, 22, 13)"
        ]
    },
};

globalThis.SIM = SIM;