import "./state.js";

function initRabbits() {
    globalThis.setRabbits([]);
    let attempts = 0;
    const maxAttempts = globalThis.INITIAL_RABBITS * 20;

    while (globalThis.getRabbits().length < globalThis.INITIAL_RABBITS && attempts < maxAttempts) {
        attempts += 1;
        const rabbit = createRabbit();
        const cx = Math.floor(rabbit.x + rabbit.w / 2);
        const cy = Math.floor(rabbit.y + rabbit.h / 2);
        const heightValue = globalThis.heightMap?.[cy]?.[cx];
        const isOnLand = heightValue !== undefined && heightValue > globalThis.SIM.terrain.waterMax;

        if (isOnLand && !isNewRabbitOverlapping(rabbit)) {
            globalThis.getRabbits().push(rabbit);
        }
    }
}

function getRabbitCount() {
    return globalThis.getRabbits().length;
}

function createRabbit() {
    const height = globalThis.SIM.rabbits.height;
    const width = globalThis.SIM.rabbits.width;
    const speed = globalThis.rabbitRandomBetween(globalThis.rabbitSimConfig.rabbits.speedMin, globalThis.rabbitSimConfig.rabbits.speedMax);

    return {
        x: globalThis.rabbitRandomBetween(0, globalThis.rabbitWorldWidth - width),
        y: globalThis.rabbitRandomBetween(0, globalThis.rabbitWorldHeight - height),
        w: width,
        h: height,
        speed: speed,
        angle: globalThis.rabbitRandomBetween(0, 359),
        hunger: globalThis.rabbitSimConfig.rabbits.hungerMax,
        age: 0,
        mature: true,
        gender: Math.random() < 0.5 ? "male" : "female",
    };
}

function isNewRabbitOverlapping(newRabbit) {
    const gap = 2;

    for (const existingRabbit of globalThis.getRabbits()) {
        if (newRabbit.x < existingRabbit.x + existingRabbit.w + gap &&
            newRabbit.x + newRabbit.w + gap > existingRabbit.x &&
            newRabbit.y < existingRabbit.y + existingRabbit.h + gap &&
            newRabbit.y + newRabbit.h + gap > existingRabbit.y) {

            return true;
        }
    }

    return false;
}

Object.assign(globalThis, {
    initRabbits,
    getRabbitCount,
    createRabbit,
    isNewRabbitOverlapping,
});
