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
        sampleSize: 100
    },
    render: {
        targetFps: 60,
        countersUpdateMs: 250,
    },
    time: {
        framesPerDay: 48,
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