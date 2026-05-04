const SIM = {
    world: {
        width: 800,
        height: 800,
    },
    terrain: {
        zoomfactor: 200, // Controls the scale of the Perlin noise for terrain generation
        waterMax: 0.30, 
        steps: 16,
        landBiomes: [
            { max: 0.55, from: [32, 55, 33],   to: [76, 95, 55]   }, // mörkt → ljust gräs
            { max: 1.00, from: [76, 100, 55],  to: [122, 110, 80]  }, // gräs → torrare gräs
        ],  
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
        initialCount: 100,
        width: 2,
        height: 2,
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