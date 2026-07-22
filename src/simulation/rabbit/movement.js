import "./state.js";
import "./eating.js";
import "./reproduction.js";
import { updateMammalOneFrame } from "../mammals/movement.js";

function updateRabbitOneFrame(rabbit, movementConfig) {
    updateMammalOneFrame(rabbit, movementConfig);

    globalThis.rabbitEatDarkGrass(rabbit);
    globalThis.rabbitLosesHunger(rabbit);
    globalThis.rabbitAgesOneFrame(rabbit);

    return globalThis.rabbitDies(rabbit);
}

function rabbitNormalWalk() {
    const rabbits = globalThis.getRabbits();
    const movementConfig = {
        ...globalThis.SIM.movement,
        heightMap: globalThis.heightMap,
    };

    for (let i = rabbits.length - 1; i >= 0; i--) {
        const rabbit = rabbits[i];
        if (updateRabbitOneFrame(rabbit, movementConfig)) {
            rabbits.splice(i, 1);
            continue;
        }
        if (typeof globalThis.rabbitGrowsUp === "function") {
            globalThis.rabbitGrowsUp(rabbit);
        }
    }

    if (typeof globalThis.rabbitReproduction === "function") {
        globalThis.rabbitReproduction();
    }

    if (typeof globalThis.rabbitBirth === "function") {
        globalThis.rabbitBirth();
    }
}

Object.assign(globalThis, {
    rabbitNormalWalk,
});
