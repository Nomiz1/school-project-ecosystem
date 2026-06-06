const rabbitSimConfig = globalThis.SIM;
const rabbitRandomBetween = globalThis.randomInt;
const rabbitWorldWidth = globalThis.WIDTH;
const rabbitWorldHeight = globalThis.HEIGHT;

const INITIAL_RABBITS = rabbitSimConfig.rabbits.initialCount;

let rabbits = [];

// --- Setup / spawning ---

function initRabbits() {
    rabbits = [];
    let attempts = 0;
    const maxAttempts = INITIAL_RABBITS * 20;

    while (rabbits.length < INITIAL_RABBITS && attempts < maxAttempts) {
        attempts += 1;
        const rabbit = createRabbit();
        const cx = Math.floor(rabbit.x + rabbit.w / 2);
        const cy = Math.floor(rabbit.y + rabbit.h / 2);
        const heightValue = globalThis.heightMap?.[cy]?.[cx];
        const isOnLand = heightValue !== undefined && heightValue > globalThis.SIM.terrain.waterMax;

        if (isOnLand && !isNewRabbitOverlapping(rabbit)) {
            rabbits.push(rabbit);
        }
    }
}

function getRabbitCount() {
    return rabbits.length;
}

function createRabbit() {
    const height = globalThis.SIM.rabbits.height;
    const width = globalThis.SIM.rabbits.width;
    const speed = rabbitRandomBetween(rabbitSimConfig.rabbits.speedMin, rabbitSimConfig.rabbits.speedMax);

    return {
        x: rabbitRandomBetween(0, rabbitWorldWidth - width),
        y: rabbitRandomBetween(0, rabbitWorldHeight - height),
        w: width,
        h: height,
        speed: speed,
        angle: rabbitRandomBetween(0, 359),
        hunger: rabbitSimConfig.rabbits.hungerMax,
        age: 0,
    };
}

function isNewRabbitOverlapping(newRabbit) {
    const gap = 2;

    for (const existingRabbit of rabbits) {
        if (newRabbit.x < existingRabbit.x + existingRabbit.w + gap &&
            newRabbit.x + newRabbit.w + gap > existingRabbit.x &&
            newRabbit.y < existingRabbit.y + existingRabbit.h + gap &&
            newRabbit.y + newRabbit.h + gap > existingRabbit.y) {

            return true;
        }
    }

    return false;
}

// --- Movement ---

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
            const testX = Math.max(0, Math.min(rabbitWorldWidth - rabbit.w, fromX + Math.cos(radians) * scanDistance));
            const testY = Math.max(0, Math.min(rabbitWorldHeight - rabbit.h, fromY + Math.sin(radians) * scanDistance));

            if (!isWaterAt(testX, testY, rabbit, heightMap, waterMax)) {
                return candidateAngle;
            }
        }
    }
    return fallbackAngle + rabbitRandomBetween(-45, 45);
}

function updateRabbitOneFrame(rabbit) {
    const heightMap = globalThis.heightMap;
    const waterMax = globalThis.SIM.terrain.waterMax;
    const prevX = rabbit.x;
    const prevY = rabbit.y;
    rabbit.angle += rabbitRandomBetween(-90, 90) * 0.35;

    const radians = rabbit.angle * (Math.PI / 180);
    rabbit.x += Math.cos(radians) * rabbit.speed;
    rabbit.y += Math.sin(radians) * rabbit.speed;

    rabbit.x = Math.max(0, Math.min(rabbitWorldWidth - rabbit.w, rabbit.x));
    rabbit.y = Math.max(0, Math.min(rabbitWorldHeight - rabbit.h, rabbit.y));

    if (isWaterAt(rabbit.x, rabbit.y, rabbit, heightMap, waterMax)) {
        rabbit.x = prevX;
        rabbit.y = prevY;
        rabbit.angle = findLandEscapeAngle(rabbit, prevX, prevY, rabbit.angle + 180, heightMap, waterMax);
    }

    rabbitEatDarkGrass(rabbit);
    rabbitLosesHunger(rabbit);
    rabbitAgesOneFrame(rabbit);

    return rabbitDies(rabbit);
}

function rabbitNormalWalk() {
    for (let i = rabbits.length - 1; i >= 0; i--) {
        const rabbit = rabbits[i];
        if (updateRabbitOneFrame(rabbit)) {
            rabbits.splice(i, 1);
            continue;
        }

    }
}

// --- Eating / hunger / death ---

function isRabbitOnDarkGrass(rabbit, heightMap, waterMax, darkGrassMax) {
    const cx = Math.floor(rabbit.x + rabbit.w / 2);
    const cy = Math.floor(rabbit.y + rabbit.h / 2);
    const heightValue = heightMap?.[cy]?.[cx];
    return heightValue !== undefined && waterMax < heightValue && heightValue <= darkGrassMax;
}

function rabbitEatDarkGrass(rabbit) {
    const heightMap = globalThis.heightMap;
    const waterMax = globalThis.SIM.terrain.waterMax;
    const darkGrassMax = globalThis.SIM.terrain.darkGrassMax;
    const cx = Math.floor(rabbit.x + rabbit.w / 2);
    const cy = Math.floor(rabbit.y + rabbit.h / 2);
    if (isRabbitOnDarkGrass(rabbit, heightMap, waterMax, darkGrassMax) && Math.random() < rabbitSimConfig.rabbits.eatChance && rabbit.hunger < rabbitSimConfig.rabbits.hungerMax) {
        heightMap[cy][cx] = Math.min(1.0, heightMap[cy][cx] + globalThis.SIM.rabbits.rabbitAffectEatenGrassFactor);
        rabbit.hunger = Math.min(globalThis.SIM.rabbits.hungerMax, rabbit.hunger + globalThis.SIM.rabbits.eatHungerGain);
        globalThis.redrawTerrainPixel(cx, cy);
    }
}
function rabbitLosesHunger(rabbit) {
    rabbit.hunger = Math.max(0, rabbit.hunger - globalThis.SIM.rabbits.hungerLossPerFrame);
}
globalThis.rabbitLosesHunger = rabbitLosesHunger;

function rabbitAgesOneFrame(rabbit) {
    const framesPerDay = globalThis.SIM.time.framesPerDay;
    const daysPerYear = 365;
    rabbit.age += 1 / (framesPerDay * daysPerYear);
}

function rabbitFatalityCheck(rabbit) {
    const A = globalThis.SIM.rabbits.makehamBaselineMortality;
    const B = globalThis.SIM.rabbits.gompertzInitialMortality;
    const C = globalThis.SIM.rabbits.gompertzAgingRate;
    const daysPerYear = 365;
    const framesPerDay = globalThis.SIM.time.framesPerDay;

    const hazardPerYear = A + B * Math.exp(C * rabbit.age);
    const hazardPerFrame = hazardPerYear / (daysPerYear * framesPerDay);
    const deathProbability = 1 - Math.exp(-hazardPerFrame);

    return Math.random() < deathProbability;
}
function rabbitDies(rabbit) {
    return rabbitFatalityCheck(rabbit) || rabbit.hunger <= 0;
}


// --- Rendering ---
function drawRabbits() {
    const ctx = globalThis.ctx;
    ctx.fillStyle = 'white';

    for (const rabbit of rabbits) {
        ctx.fillRect(rabbit.x, rabbit.y, rabbit.w, rabbit.h);
    }
}

Object.assign(globalThis, {
    initRabbits,
    getRabbitCount,
    createRabbit,
    isNewRabbitOverlapping,
    rabbitNormalWalk,
    rabbitEatDarkGrass,
    rabbitAgesOneFrame,
    rabbitFatalityCheck,
    rabbitDies,
    drawRabbits,
});
