const INITIAL_RABBIT = 10;

let Rabbits = [];

// Initialize rabbits without overlapping existing rabbits
function initRabbit() {
    Rabbits = [];
    let attempts = 0;
    const maxAttempts = INITIAL_RABBIT * 20;

    while (Rabbits.length < INITIAL_RABBIT && attempts < maxAttempts) {
        attempts += 1;
        const rabbit = createRabbit();
        if (!rabbitOverlaps(rabbit)) {
            Rabbits.push(rabbit);
        }
    }
}

// Create a new rabbit with random position, size, and speed
function createRabbit() {
    const maxHeight = randomInt(15, 20);
    const width = randomInt(5, 10);
    const speed = randomInt(1, 3);
    const jumpChance = 0.05; 
    const jumpPower = randomInt(2, 5); 

    return {
        x: randomInt(0, WIDTH - width),
        y: randomInt(0, HEIGHT - maxHeight),
        w: width,
        h: maxHeight,
        speed: speed,
        angle: randomInt(0, 359),
        jumpChance: jumpChance,
        jumpPower: jumpPower,
        jumpVx: 0,
        jumpVy: 0,
    };
}

// Check if the new rabbit overlaps with any existing rabbits
function rabbitOverlaps(newRabbit) {
    const gap = 2;

    for (const existingRabbit of Rabbits) {
        if (newRabbit.x < existingRabbit.x + existingRabbit.w + gap &&
            newRabbit.x + newRabbit.w + gap > existingRabbit.x &&
            newRabbit.y < existingRabbit.y + existingRabbit.h + gap &&
            newRabbit.y + newRabbit.h + gap > existingRabbit.y) {
            console.log(
                `Overlap detected -> new: (x=${newRabbit.x}, y=${newRabbit.y}, w=${newRabbit.w}, h=${newRabbit.h}), existing: (x=${existingRabbit.x}, y=${existingRabbit.y}, w=${existingRabbit.w}, h=${existingRabbit.h})`
            );

            return true;
        }
    }

    return false;
}


function rabbitNormalWalk() {
    for (const rabbit of Rabbits) {
        // Slightly nudge the angle each frame for smooth wandering
        rabbit.angle += randomInt(-90, 90) * 0.35; // Adjust the multiplier for more or less erratic movement

        const radians = rabbit.angle * (Math.PI / 180);
        rabbit.x += Math.cos(radians) * rabbit.speed;
        rabbit.y += Math.sin(radians) * rabbit.speed;

        // Keep rabbit within canvas bounds
        rabbit.x = Math.max(0, Math.min(WIDTH - rabbit.w, rabbit.x));
        rabbit.y = Math.max(0, Math.min(HEIGHT - rabbit.h, rabbit.y));

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
        rabbit.x = Math.max(0, Math.min(WIDTH - rabbit.w, rabbit.x));
        rabbit.y = Math.max(0, Math.min(HEIGHT - rabbit.h, rabbit.y));
    }
}

function rabbitEatGrass() {
    for (const rabbit of Rabbits) {
        for (let i = grass.length - 1; i >= 0; i--) {
            const patch = grass[i];
            const rabbitEatGrassChance = 1.0; 

            if (Math.random() < rabbitEatGrassChance &&
                rabbit.x < patch.x + patch.w &&
                rabbit.x + rabbit.w > patch.x &&
                rabbit.y < patch.y + patch.currentH &&
                rabbit.y + rabbit.h > patch.y && patch.grown) {
                patch.currentH = Math.max(1, patch.h *0.5);
                patch.grown = false;
            }
        }
    }
}

// Draw rabbits as white rectangles
function drawRabbits() {
    for (const rabbit of Rabbits) {
        ctx.fillStyle = 'white';
        ctx.fillRect(rabbit.x, rabbit.y, rabbit.w, rabbit.h);
    }
}

// If 500 grass or more exist then rabbits eat with randomly 
// If 500 or less grass exist then the rabbits will look for grass and eat it if they find it
//Next step: When a rabbit eats a grassstraw, the grass will become half its size and start regrowing. 