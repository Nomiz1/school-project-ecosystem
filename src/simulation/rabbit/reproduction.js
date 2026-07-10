import "./state.js";

function rabbitMatureCheck(rabbit) {
    if (!rabbit.mature && rabbit.age >= globalThis.SIM.rabbits.matureAge) {
        rabbit.mature = true;
    }
}

function rabbitTouching(rabbit1, rabbit2, gap = 2) {
    return (
        rabbit1.x < rabbit2.x + rabbit2.w + gap &&
        rabbit1.x + rabbit1.w + gap > rabbit2.x &&
        rabbit1.y < rabbit2.y + rabbit2.h + gap &&
        rabbit1.y + rabbit1.h + gap > rabbit2.y
    );
}

function rabbitReproduction() {
    const rabbits = globalThis.getRabbits();

    if (getMonthOfYear() >= 1 && getMonthOfYear() <= 7) {
        for (let i = 0; i < rabbits.length; i++) {
            const rabbitA = rabbits[i];
            if (!rabbitA.mature) continue;

            for (let j = i + 1; j < rabbits.length; j++) {
                const rabbitB = rabbits[j];
                if (!rabbitB.mature) continue;

                if (rabbitA.gender === rabbitB.gender) continue;
                if (!rabbitTouching(rabbitA, rabbitB)) continue;

                const femaleRabbit = rabbitA.gender === "female" ? rabbitA : rabbitB;
                if (femaleRabbit.pregnant) continue;
                femaleRabbit.pregnant = true;
                femaleRabbit.pregnancyTimer = globalThis.SIM.rabbits.gestationPeriodFrames;
                femaleRabbit.pregnancyLitterSize = globalThis.rabbitRandomBetween(4, 6);
                femaleRabbit.pregnancySpeedMin = Math.min(rabbitA.speed, rabbitB.speed);
                femaleRabbit.pregnancySpeedMax = Math.max(rabbitA.speed, rabbitB.speed);
                console.log("Rabbit became pregnant", {
                    x: femaleRabbit.x,
                    y: femaleRabbit.y,
                    litterSize: femaleRabbit.pregnancyLitterSize,
                    speedMin: femaleRabbit.pregnancySpeedMin,
                    speedMax: femaleRabbit.pregnancySpeedMax,
                });
                break; 
            }
        }
    }
}

function createBabyRabbit(parentRabbit) {
    const height = globalThis.SIM.rabbits.babyheight;
    const width = globalThis.SIM.rabbits.babywidth;
    const speedMin = Number.isFinite(parentRabbit?.pregnancySpeedMin)
        ? parentRabbit.pregnancySpeedMin
        : parentRabbit.speed;
    const speedMax = Number.isFinite(parentRabbit?.pregnancySpeedMax)
        ? parentRabbit.pregnancySpeedMax
        : parentRabbit.speed;

    return {
        x: Math.max(
            0,
            Math.min(
                globalThis.rabbitWorldWidth - width,
                (parentRabbit?.x ?? 0) + globalThis.rabbitRandomBetween(-1, 1)
            )
        ),
        y: Math.max(
            0,
            Math.min(
                globalThis.rabbitWorldHeight - height,
                (parentRabbit?.y ?? 0) + globalThis.rabbitRandomBetween(-1, 1)
            )
        ),
        w: globalThis.SIM.rabbits.babywidth,
        h: globalThis.SIM.rabbits.babyheight,
        speed: globalThis.randomFloat(speedMin, speedMax),
        angle: globalThis.rabbitRandomBetween(0, 359),
        hunger: globalThis.SIM.rabbits.hungerMax,
        age: 0,
        mature: false,
        gender: Math.random() < 0.5 ? "male" : "female",
    };
}

function rabbitBirth() {
    const rabbits = globalThis.getRabbits();
    const newbornRabbits = [];

    for (const rabbit of rabbits) {
        if (!rabbit.pregnant) continue;

        rabbit.pregnancyTimer -= 1;
        if (rabbit.pregnancyTimer <= 0) {
            rabbit.pregnant = false;
            rabbit.pregnancyTimer = 0;

            const litterSize = Number.isFinite(rabbit.pregnancyLitterSize)
                ? rabbit.pregnancyLitterSize
                : 1;

            for (let i = 0; i < litterSize; i++) {
                newbornRabbits.push(createBabyRabbit(rabbit));
            }

            rabbit.pregnancyLitterSize = 0;
        }
    }

    if (newbornRabbits.length > 0) {
        rabbits.push(...newbornRabbits);
    }
}

Object.assign(globalThis, {
    rabbitMatureCheck,
    rabbitReproduction,
    rabbitBirth,
    createBabyRabbit,
});