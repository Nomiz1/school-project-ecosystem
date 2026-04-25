
let Rabbit = [];

function createRabbit() {
    const maxHeight = randomInt(20, 40);
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

function rabbitOverlaps(rabbit) {
    const gap = 2;

    for (const r of Rabbit) {
        if (rabbit.x < r.x + r.w + gap &&
            rabbit.x + rabbit.w + gap > r.x &&
            rabbit.y < r.y + r.h + gap &&
            rabbit.y + rabbit.h + gap > r.y) {
            return true;
        }
    }

    return false;
}
 function initRabbit() {
    Rabbit = [];
    let attempts = 0;
    const maxAttempts = INITIAL_RABBIT * 20;
    
    while (Rabbit.length < INITIAL_RABBIT && attempts < maxAttempts) {
        attempts += 1;
        const rabbit = createRabbit();
        if (!rabbitOverlaps(rabbit)) {
            Rabbit.push(rabbit);
        }
    }
}
