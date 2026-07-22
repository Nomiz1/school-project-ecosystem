import "./state.js";
import "./aging.js";
import { mammalLosesHunger, mammalDies } from "../mammals/eating.js";

function isRabbitOnDarkGrass(rabbit, heightMap, waterMax, darkGrassMax) {
    const cx = Math.floor(rabbit.x + rabbit.w / 2);
    const cy = Math.floor(rabbit.y + rabbit.h / 2);
    const heightValue = heightMap?.[cy]?.[cx];
    return heightValue !== undefined && waterMax < heightValue && heightValue <= darkGrassMax;
}

function rabbitEatDarkGrass(rabbit) {
    const heightMap = globalThis.heightMap;
    const waterMax = globalThis.SIM.terrain.waterMax;
    const darkGrassMax = globalThis.SIM.terrain.darkGrassMax;
    const cx = Math.floor(rabbit.x + rabbit.w / 2);
    const cy = Math.floor(rabbit.y + rabbit.h / 2);
    if (isRabbitOnDarkGrass(rabbit, heightMap, waterMax, darkGrassMax) && Math.random() < globalThis.rabbitSimConfig.rabbits.eatChance && rabbit.hunger < globalThis.rabbitSimConfig.rabbits.hungerMax) {
        heightMap[cy][cx] = Math.min(1.0, heightMap[cy][cx] + globalThis.SIM.rabbits.rabbitAffectEatenGrassFactor);
        rabbit.hunger = Math.min(globalThis.SIM.rabbits.hungerMax, rabbit.hunger + globalThis.SIM.rabbits.eatHungerGain);
        globalThis.redrawTerrainPixel(cx, cy);
    }
}

function rabbitLosesHunger(rabbit) {
    mammalLosesHunger(rabbit, globalThis.SIM.rabbits);
}

function rabbitDies(rabbit) {
    return mammalDies(rabbit, globalThis.rabbitFatalityCheck);
}

Object.assign(globalThis, {
    rabbitEatDarkGrass,
    rabbitLosesHunger,
    rabbitDies,
});
