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
        initialCount: 400,
        growthPerTick: 0.10,
        rabbitEatGrassPart: 1,
        minEatenHeight: 1,
    },
    rabbits: {
        initialCount: 10,
        widthMin: 5,
        widthMax: 10,
        heightMin: 15,
        heightMax: 20,
        speedMin: 1,
        speedMax: 3,
        jumpChance: 0.05,
        jumpPowerMin: 2,
        jumpPowerMax: 5,
        eatChance: 0.5,
        energyMax: 100,
    },
    dayNightCycle: {
        framesPerDay: 10800, // 3 minutes at 60 FPS
        nightGrassGrowthMultiplier: 0.5,
        nightRabbitSpeedMultiplier: 0.2,
        maxDarkness: 0.5, // Max darkness level (0 to 1)
    },
    background: {
        pixelSize: 8,
        colors: [
            [38, 7, 1],
            [47, 14, 7],
            [56, 22, 13],
        ],
    },
};

globalThis.SIM = SIM;