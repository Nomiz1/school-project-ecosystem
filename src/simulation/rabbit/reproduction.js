import "./state.js";

function rabbitMatureCheck(rabbit) {
    if (!rabbit.mature && rabbit.age >= globalThis.SIM.rabbits.matureAge) {
        rabbit.mature = true;
    }
}

function rabbitReproduction() {
    const rabbits = globalThis.getRabbits();
    const matureMales = rabbits.filter((r) => r.mature && r.gender === "male");
    const matureFemales = rabbits.filter((r) => r.mature && r.gender === "female");

    if (matureMales.length === 0 || matureFemales.length === 0) {
        return;
    }
}

Object.assign(globalThis, {
    rabbitMatureCheck,
    rabbitReproduction,
});
