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

                if (rabbitA.gender !== rabbitB.gender) continue;
                if (!rabbitTouching(rabbitA, rabbitB)) continue;

                const femaleRabbit = rabbitA.gender === "female" ? rabbitA : rabbitB;
                femaleRabbit.pregnant = true;
                femaleRabbit.pregnancyTimer = globalThis.SIM.rabbits.gestationPeriodFrames;
                break; // Each rabbit can only reproduce once per frame
            }
        }
    }
}

    Object.assign(globalThis, {
        rabbitMatureCheck,
        rabbitReproduction,
    });
