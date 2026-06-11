const rabbitSimConfig = globalThis.SIM;
const rabbitRandomBetween = globalThis.randomInt;
const rabbitWorldWidth = globalThis.WIDTH;
const rabbitWorldHeight = globalThis.HEIGHT;

const INITIAL_RABBITS = rabbitSimConfig.rabbits.initialCount;

let rabbits = [];

function getRabbits() {
    return rabbits;
}

function setRabbits(nextRabbits) {
    rabbits = nextRabbits;
}

Object.assign(globalThis, {
    rabbitSimConfig,
    rabbitRandomBetween,
    rabbitWorldWidth,
    rabbitWorldHeight,
    INITIAL_RABBITS,
    getRabbits,
    setRabbits,
});
