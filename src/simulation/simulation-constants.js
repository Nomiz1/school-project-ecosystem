const SIM = {
    world: {
        width: 800,
        height: 800,
    },
    render: {
        targetFps: 60,
        countersUpdateMs: 250,
    },
    grass: {
        initialCount: 5000,
        growthPerTick: 1/24, // Grows from minGrassLevel to full height in about 16 sim-days with current day/night modifier
        maxGrassLevel: 16,
        minGrassLevel: 0,
        sproutChance: 0.05,
        darkenChance: 0.02,
        colors: [
            "rgb(60, 179, 60)",
            "rgb(46, 139, 46)",
            "rgb(24, 120, 24)",
            "rgb(34, 102, 34)"
        ]
    },
    rabbits: {
        initialCount: 10,
        widthMin: 5,
        widthMax: 10,
        heightMin: 15,
        heightMax: 20,
        speedMin: 1,
        speedMax: 3,
        eatChance: 0.5,
        energyMax: 100,
    },
    dayNightCycle: {
        framesPerDay: 48, 
        nightGrassGrowthMultiplier: 0,
        nightRabbitSpeedMultiplier: 0.2,
        maxDarkness: 0.5, // Max darkness level (0 to 1)
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