
export function mammalTouching(mammal1, mammal2, gap = 2) {
    return (
        mammal1.x < mammal2.x + mammal2.w + gap &&
        mammal1.x + mammal1.w + gap > mammal2.x &&
        mammal1.y < mammal2.y + mammal2.h + gap &&
        mammal1.y + mammal1.h + gap > mammal2.y
    );
}

export function canMammalBecomePregnantThisYear(mammal, currentYearIndex) {

    if (mammal.pregnancyYearIndex !== currentYearIndex) {
        mammal.pregnancyYearIndex = currentYearIndex;
        mammal.timesPregnantThisYear = 0;
    }

    if (!Number.isFinite(mammal.maxTimesPregnantPerYear)) {
        return true;
    }


    return mammal.timesPregnantThisYear < mammal.maxTimesPregnantPerYear;
}

 export function mammalReproduction(mammals, currentMonth, currentYearIndex, reproductionConfig) {
     const resolvedReproductionConfig = reproductionConfig ?? globalThis.SIM?.mammals?.reproduction;

    if (currentMonth >= 1 && currentMonth <= 7) {
        for (let i = 0; i < mammals.length; i++) {
            const mammalA = mammals[i];
            if (!mammalA.mature) continue;

            for (let j = i + 1; j < mammals.length; j++) {
                const mammalB = mammals[j];
                if (!mammalB.mature) continue;

                if (mammalA.gender === mammalB.gender) continue;
                if (!mammalTouching(mammalA, mammalB)) continue;

                const femaleMammal = mammalA.gender === "female" ? mammalA : mammalB;
                if (femaleMammal.pregnant) continue;
                if (!canMammalBecomePregnantThisYear(femaleMammal, currentYearIndex)) continue;
                femaleMammal.pregnant = true;
                femaleMammal.timesPregnantThisYear += 1;
                femaleMammal.pregnancyTimer = resolvedReproductionConfig.gestationPeriodFrames;
                femaleMammal.pregnancyLitterSize = globalThis.randomInt(
                    resolvedReproductionConfig.litterSizeMin,
                    resolvedReproductionConfig.litterSizeMax
                );
                femaleMammal.pregnancySpeedMin = Math.min(mammalA.speed, mammalB.speed);
                femaleMammal.pregnancySpeedMax = Math.max(mammalA.speed, mammalB.speed);
                break; 
            }
        }
    }
}