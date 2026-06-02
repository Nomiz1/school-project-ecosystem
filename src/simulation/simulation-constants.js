import { browserLocale, i18nTexts } from "./language.js";

const SIM = {
    world: {
        width: 800,
        height: 800,
    },
    terrain: {
        zoomfactor: 200, // Controls the scale of the Perlin noise for terrain generation
        waterMax: 0.30,
        darkGrassMax: 0.55,
        lightGrassMax: 1.00,
        steps: 16,
        grassNearWater: 20,
        sampleSize: 200
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
    rabbits: {
        initialCount: 100,
        width: 2,
        height: 2,
        speedMin: 1,
        speedMax: 3,
        eatChance: 0.5,
        hungerMax: 100,
        eatHungerGain: 10,
        hungerLossPerFrame: 0.5,
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