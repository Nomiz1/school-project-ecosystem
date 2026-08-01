const INITIAL_RABBITS = globalThis.SIM.rabbits.initialCount;

let rabbits = [];

function getRabbits() {
    return rabbits;
}

function setRabbits(nextRabbits) {
    rabbits = nextRabbits;
}

Object.assign(globalThis, {
    INITIAL_RABBITS,
    getRabbits,
    setRabbits,
});
