
const INITIAL_FOXES = globalThis.SIM.foxes.initialCount;

let foxes = [];

function getFoxes() {
    return foxes;
}

function setFoxes(nextFoxes) {
    foxes = nextFoxes;
}

Object.assign(globalThis, {
    INITIAL_FOXES,
    getFoxes,
    setFoxes,
});