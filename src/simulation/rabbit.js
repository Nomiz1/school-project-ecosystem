const rabbitSimConfig = globalThis.SIM;
const rabbitRandomBetween = globalThis.randomInt;
const rabbitWorldWidth = globalThis.WIDTH;
const rabbitWorldHeight = globalThis.HEIGHT;

const INITIAL_RABBITS = rabbitSimConfig.rabbits.initialCount;
const maxEnergyLevel = rabbitSimConfig.rabbits.energyMax;



let rabbits = [];

// --- Setup / spawning ---

// Initialize rabbits without overlapping existing rabbits.
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

function checkRabbitEnergyLevel(rabbit) {
    return rabbit.energy > 0;
}

// Create a new rabbit with random position, size, and movement traits.
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
        energy: maxEnergyLevel,
        hunger: 0,
        age: 0,
    };
}

// Check if a new rabbit overlaps with any existing rabbit.
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

function isWaterAt(x, y, rabbit) {
    const cx = Math.floor(x + rabbit.w / 2);
    const cy = Math.floor(y + rabbit.h / 2);
    const heightValue = globalThis.heightMap?.[cy]?.[cx];
    return heightValue !== undefined && heightValue <= globalThis.SIM.terrain.waterMax;
}

function findLandEscapeAngle(rabbit, fromX, fromY, fallbackAngle) {
    const scanDistance = Math.max(rabbit.speed * 1.5, 2);

    for (let offset = 0; offset <= 180; offset += 20) {
        const candidates = offset === 0
            ? [fallbackAngle]
            : [fallbackAngle + offset, fallbackAngle - offset];

        for (const candidateAngle of candidates) {
            const radians = candidateAngle * (Math.PI / 180);
            const testX = Math.max(0, Math.min(rabbitWorldWidth - rabbit.w, fromX + Math.cos(radians) * scanDistance));
            const testY = Math.max(0, Math.min(rabbitWorldHeight - rabbit.h, fromY + Math.sin(radians) * scanDistance));

            if (!isWaterAt(testX, testY, rabbit)) {
                return candidateAngle;
            }
        }
    }

    return fallbackAngle + rabbitRandomBetween(-45, 45);
}
function isRabbitOnDarkGrass(rabbit) {
    const cx = Math.floor(rabbit.x + rabbit.w / 2);
    const cy = Math.floor(rabbit.y + rabbit.h / 2);
    const heightValue = globalThis.heightMap?.[cy]?.[cx];
    return heightValue !== undefined && globalThis.SIM.terrain.waterMax < heightValue && heightValue <= globalThis.SIM.terrain.darkGrassMax;
}

function rabbitEatDarkGrass(rabbit) {
    const cx = Math.floor(rabbit.x + rabbit.w / 2);
    const cy = Math.floor(rabbit.y + rabbit.h / 2);
    if (isRabbitOnDarkGrass(rabbit) && Math.random() < rabbitSimConfig.rabbits.eatChance && rabbit.hunger < rabbitSimConfig.rabbits.hungerMax) {
        globalThis.heightMap[cy][cx] = Math.min(1.0, globalThis.heightMap[cy][cx] + globalThis.SIM.rabbits.rabbitAffectEatenGrassFactor);
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
    // Gompertz-Makeham parameters calibrated for total rabbit population.
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

function rabbitNormalWalk() {
    for (let i = rabbits.length - 1; i >= 0; i--) {
        const rabbit = rabbits[i];
        const prevX = rabbit.x;
        const prevY = rabbit.y;
        rabbit.angle += rabbitRandomBetween(-90, 90) * 0.35; // Adjust the multiplier for more or less erratic movement

        const radians = rabbit.angle * (Math.PI / 180);
        rabbit.x += Math.cos(radians) * rabbit.speed;
        rabbit.y += Math.sin(radians) * rabbit.speed;

        // Keep rabbit within canvas bounds
        rabbit.x = Math.max(0, Math.min(rabbitWorldWidth - rabbit.w, rabbit.x));
        rabbit.y = Math.max(0, Math.min(rabbitWorldHeight - rabbit.h, rabbit.y));

        if (isWaterAt(rabbit.x, rabbit.y, rabbit)) {
            // Revert invalid movement so rabbits never settle on water pixels.
            rabbit.x = prevX;
            rabbit.y = prevY;
            rabbit.angle = findLandEscapeAngle(rabbit, prevX, prevY, rabbit.angle + 180);
        }

        rabbitEatDarkGrass(rabbit);
        rabbitLosesHunger(rabbit);
        rabbitAgesOneFrame(rabbit);

        if (rabbitFatalityCheck(rabbit)) {
            rabbits.splice(i, 1);
        }
    }
}

// --- Rendering ---

// Draw rabbits as white rectangles
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
    drawRabbits,
});
