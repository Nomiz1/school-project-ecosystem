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

    return {
        x: randomInt(0, WIDTH - width),
        y: randomInt(0, HEIGHT - maxHeight),
        w: width,
        h: maxHeight,
        speed: speed,
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

/*
function moveRabbits() {
    for (const rabbit of Rabbits) {
        rabbit.y += rabbit.speed;
    }
}
*/
// Draw rabbits as white rectangles
function drawRabbits() {
    for (const rabbit of Rabbits) {
        ctx.fillStyle = 'white';
        ctx.fillRect(rabbit.x, rabbit.y, rabbit.w, rabbit.h);
    }
}
