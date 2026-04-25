
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
