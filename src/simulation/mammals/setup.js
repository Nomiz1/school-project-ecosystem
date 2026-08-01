
export function mammalTouchingForSetup(mammal1, mammal2, gap = 2) {
    return (
        mammal1.x < mammal2.x + mammal2.w + gap &&
        mammal1.x + mammal1.w + gap > mammal2.x &&
        mammal1.y < mammal2.y + mammal2.h + gap &&
        mammal1.y + mammal1.h + gap > mammal2.y
    );
}

export function initMammals(getMammalsFunc, setMammalsFunc, initialCount, createMammalFunc) {
    setMammalsFunc([]);
    let attempts = 0;
    const maxAttempts = initialCount * 20;

    while (getMammalsFunc().length < initialCount && attempts < maxAttempts) {
        attempts += 1;
        const mammal = createMammalFunc();
        const cx = Math.floor(mammal.x + mammal.w / 2);
        const cy = Math.floor(mammal.y + mammal.h / 2);
        const heightValue = globalThis.heightMap?.[cy]?.[cx];
        const isOnLand = heightValue !== undefined && heightValue > globalThis.SIM.terrain.waterMax;

        if (isOnLand && !isNewMammalOverlapping(mammal, getMammalsFunc())) {
            getMammalsFunc().push(mammal);
        }
    }
}

export function isNewMammalOverlapping(newMammal, existingMammals) {
    const gap = 2;

    for (const existingMammal of existingMammals) {
        if (mammalTouchingForSetup(newMammal, existingMammal, gap)) {
            return true;
        }
    }

    return false;
}
