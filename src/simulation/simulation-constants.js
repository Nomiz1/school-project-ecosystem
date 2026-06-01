const browserLocale =
    typeof navigator !== "undefined"
        ? navigator.languages?.[0] || navigator.language || "sv-SE"
        : "sv-SE";

const i18nTexts = {
    en: {
        pageTitle: "School Ecosystem Simulation",
        appTitle: "Ecosystem Simulation",
        subtitle: "By: Zimon Roos",
        rainNo: "Is it raining? No",
        rainYes: "Is it raining? Yes",
        rabbitCountLabel: "Rabbits",
        timeLabel: "Time",
        dayLabel: "Day",
        dateTimeLabel: "Date",
        resetButton: "Reset",
        xLabel: "X",
        yLabel: "Y",
        terrainUnknown: "?",
        terrainWater: "Water",
        terrainGrass: "Grass",
        terrainDryGrass: "Dry grass",
        canvasAria: "Ecosystem simulation canvas",
    },
    sv: {
        pageTitle: "Skolans ekosystemsimulering",
        appTitle: "Ekosystemsimulering",
        subtitle: "Av: Zimon Roos",
        rainNo: "Regnar det? Nej",
        rainYes: "Regnar det? Ja",
        rabbitCountLabel: "Kaniner",
        timeLabel: "Tid",
        dayLabel: "Dag",
        dateTimeLabel: "Datum",
        resetButton: "Återställ",
        xLabel: "X",
        yLabel: "Y",
        terrainUnknown: "?",
        terrainWater: "Vatten",
        terrainGrass: "Gräs",
        terrainDryGrass: "Torrt gräs",
        canvasAria: "Canvas for ekosystemsimulering",
    },
};

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
        intensityBurstAllowance: 1.4, // Allows rain intensity to temporarily exceed profile max to meet monthly targets
        lightRainMaxMm: 6.0,
        middleRainMaxMm: 13.0,
        darkRainMaxMm: 20.0,
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