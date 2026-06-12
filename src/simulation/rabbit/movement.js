import "./state.js";
import "./eating.js";
import "./reproduction.js";

function isWaterAt(x, y, rabbit, heightMap, waterMax) {
    const cx = Math.floor(x + rabbit.w / 2);
    const cy = Math.floor(y + rabbit.h / 2);
    const heightValue = heightMap?.[cy]?.[cx];
    return heightValue !== undefined && heightValue <= waterMax;
}

function findLandEscapeAngle(rabbit, fromX, fromY, fallbackAngle, heightMap, waterMax) {
    const scanDistance = Math.max(rabbit.speed * 1.5, 2);

    for (let offset = 0; offset <= 180; offset += 20) {
        const candidates = offset === 0
            ? [fallbackAngle]
            : [fallbackAngle + offset, fallbackAngle - offset];

        for (const candidateAngle of candidates) {
            const radians = candidateAngle * (Math.PI / 180);
            const testX = Math.max(0, Math.min(globalThis.rabbitWorldWidth - rabbit.w, fromX + Math.cos(radians) * scanDistance));
            const testY = Math.max(0, Math.min(globalThis.rabbitWorldHeight - rabbit.h, fromY + Math.sin(radians) * scanDistance));

            if (!isWaterAt(testX, testY, rabbit, heightMap, waterMax)) {
                return candidateAngle;
            }
        }
    }
    return fallbackAngle + globalThis.rabbitRandomBetween(-45, 45);
}

function updateRabbitOneFrame(rabbit) {
    const heightMap = globalThis.heightMap;
    const waterMax = globalThis.SIM.terrain.waterMax;
    const prevX = rabbit.x;
    const prevY = rabbit.y;
    rabbit.angle += globalThis.rabbitRandomBetween(-90, 90) * 0.35;

    const radians = rabbit.angle * (Math.PI / 180);
    rabbit.x += Math.cos(radians) * rabbit.speed;
    rabbit.y += Math.sin(radians) * rabbit.speed;

    rabbit.x = Math.max(0, Math.min(globalThis.rabbitWorldWidth - rabbit.w, rabbit.x));
    rabbit.y = Math.max(0, Math.min(globalThis.rabbitWorldHeight - rabbit.h, rabbit.y));

    if (isWaterAt(rabbit.x, rabbit.y, rabbit, heightMap, waterMax)) {
        rabbit.x = prevX;
        rabbit.y = prevY;
        rabbit.angle = findLandEscapeAngle(rabbit, prevX, prevY, rabbit.angle + 180, heightMap, waterMax);
    }

    globalThis.rabbitEatDarkGrass(rabbit);
    globalThis.rabbitLosesHunger(rabbit);
    globalThis.rabbitAgesOneFrame(rabbit);

    return globalThis.rabbitDies(rabbit);
}

function rabbitNormalWalk() {
    const rabbits = globalThis.getRabbits();

    for (let i = rabbits.length - 1; i >= 0; i--) {
        const rabbit = rabbits[i];
        if (updateRabbitOneFrame(rabbit)) {
            rabbits.splice(i, 1);
            continue;
        }
        if (typeof globalThis.rabbitGrowsUp === "function") {
            globalThis.rabbitGrowsUp(rabbit);
        }
    }

    if (typeof globalThis.rabbitReproduction === "function") {
        globalThis.rabbitReproduction();
    }

    if (typeof globalThis.rabbitBirth === "function") {
        globalThis.rabbitBirth();
    }
}

Object.assign(globalThis, {
    rabbitNormalWalk,
});
