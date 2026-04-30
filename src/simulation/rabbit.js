const rabbitSimConfig = globalThis.SIM;
const rabbitRandomBetween = globalThis.randomInt;
const rabbitWorldWidth = globalThis.WIDTH;
const rabbitWorldHeight = globalThis.HEIGHT;

const INITIAL_RABBITS = rabbitSimConfig.rabbits.initialCount;



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
        if (!isNewRabbitOverlapping(rabbit)) {
            rabbits.push(rabbit);
        }
    }
}

function getRabbitCount() {
    return rabbits.length;
}

// Create a new rabbit with random position, size, and movement traits.
function createRabbit() {
    const maxHeight = rabbitRandomBetween(rabbitSimConfig.rabbits.heightMin, rabbitSimConfig.rabbits.heightMax);
    const width = rabbitRandomBetween(rabbitSimConfig.rabbits.widthMin, rabbitSimConfig.rabbits.widthMax);
    const speed = rabbitRandomBetween(rabbitSimConfig.rabbits.speedMin, rabbitSimConfig.rabbits.speedMax);
    const jumpChance = rabbitSimConfig.rabbits.jumpChance;
    const jumpPower = rabbitRandomBetween(rabbitSimConfig.rabbits.jumpPowerMin, rabbitSimConfig.rabbits.jumpPowerMax);

    return {
        x: rabbitRandomBetween(0, rabbitWorldWidth - width),
        y: rabbitRandomBetween(0, rabbitWorldHeight - maxHeight),
        w: width,
        h: maxHeight,
        speed: speed,
        angle: rabbitRandomBetween(0, 359),
        jumpChance: jumpChance,
        jumpPower: jumpPower,
        jumpVx: 0,
        jumpVy: 0,
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

function rabbitNormalWalk() {
    for (const rabbit of rabbits) {
        // Slightly nudge the angle each frame for smooth wandering
        rabbit.angle += rabbitRandomBetween(-90, 90) * 0.35; // Adjust the multiplier for more or less erratic movement

        const radians = rabbit.angle * (Math.PI / 180);
        rabbit.x += Math.cos(radians) * rabbit.speed;
        rabbit.y += Math.sin(radians) * rabbit.speed;

        // Keep rabbit within canvas bounds
        rabbit.x = Math.max(0, Math.min(rabbitWorldWidth - rabbit.w, rabbit.x));
        rabbit.y = Math.max(0, Math.min(rabbitWorldHeight - rabbit.h, rabbit.y));

        // Apply ongoing jump velocity
        rabbit.x += rabbit.jumpVx;
        rabbit.y += rabbit.jumpVy;
        rabbit.jumpVx *= 0.85;
        rabbit.jumpVy *= 0.85;

        // Trigger a new jump in the current angle direction
        if (Math.random() < rabbit.jumpChance) {
            const jumpRadians = rabbit.angle * (Math.PI / 180);
            rabbit.jumpVx = Math.cos(jumpRadians) * rabbit.jumpPower;
            rabbit.jumpVy = Math.sin(jumpRadians) * rabbit.jumpPower;
        }

        // Keep rabbit within canvas bounds after jump movement
        rabbit.x = Math.max(0, Math.min(rabbitWorldWidth - rabbit.w, rabbit.x));
        rabbit.y = Math.max(0, Math.min(rabbitWorldHeight - rabbit.h, rabbit.y));
    }
}

// --- Eating / collision ---


function isRabbitOverlappingGrass(rabbit, patch) {
    const rabbitBox = getRabbitCollisionBox(rabbit);
    const patchBox = getGrassVisibleCollisionBox(patch);

    return areBoxesOverlapping(rabbitBox, patchBox);
}

function rabbitEatGrass() {
    const activeGrass = typeof grass !== "undefined" ? grass : (globalThis.grass || []);

    for (const rabbit of rabbits) {
        for (let patchIndex = activeGrass.length - 1; patchIndex >= 0; patchIndex--) {
            const patch = activeGrass[patchIndex];
            const rabbitEatGrassChance = rabbitSimConfig.rabbits.eatChance;

            if (Math.random() < rabbitEatGrassChance && isRabbitOverlappingGrass(rabbit, patch) && patch.grown) {
                patch.currentH = Math.max(rabbitSimConfig.grass.minEatenHeight, patch.h * rabbitSimConfig.grass.eatenHeightFactor);
                patch.grown = false;
            }

        }
    }
}


function getRabbitCollisionBox(rabbit) {
    return {
        x: rabbit.x,
        y: rabbit.y,
        w: rabbit.w,
        h: rabbit.h,
    };
}

function getGrassVisibleCollisionBox(patch) {
    const baseRadius = Math.min(patch.w, patch.h) / 2;
    const growthRatio = patch.currentH / patch.h;
    const radius = Math.max(1, baseRadius * growthRatio);
    const size = radius * 2;

    return {
        x: patch.x + patch.w / 2 - radius,
        y: patch.y + patch.h / 2 - radius,
        w: size,
        h: size,
    };
}

function areBoxesOverlapping(firstBox, secondBox) {
    return (
        firstBox.x < secondBox.x + secondBox.w &&
        firstBox.x + firstBox.w > secondBox.x &&
        firstBox.y < secondBox.y + secondBox.h &&
        firstBox.y + firstBox.h > secondBox.y
    );
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
    isRabbitOverlappingGrass,
    rabbitEatGrass,
    getRabbitCollisionBox,
    getGrassVisibleCollisionBox,
    areBoxesOverlapping,
    drawRabbits,
});
// For the future:
// If 500 grass or more exist then rabbits eat with randomly 
// If 500 or less grass exist then the rabbits will look for grass and eat it if they find it
//Next step: When a rabbit eats a grassstraw, the grass will become half its size and start regrowing. 