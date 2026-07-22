
export function isWaterAt(x, y, mammal, heightMap, waterMax) {
    const cx = Math.floor(x + mammal.w / 2);
    const cy = Math.floor(y + mammal.h / 2);
    const heightValue = heightMap?.[cy]?.[cx];
    return heightValue !== undefined && heightValue <= waterMax;
}

export function findLandEscapeAngle(mammal, fromX, fromY, fallbackAngle, heightMap, waterMax, worldConfig) {
    const scanDistance = Math.max(mammal.speed * 1.5, 2);
    const worldWidth = worldConfig?.width ?? globalThis.WIDTH;
    const worldHeight = worldConfig?.height ?? globalThis.HEIGHT;

    for (let offset = 0; offset <= 180; offset += 20) {
        const candidates = offset === 0
            ? [fallbackAngle]
            : [fallbackAngle + offset, fallbackAngle - offset];

        for (const candidateAngle of candidates) {
            const radians = candidateAngle * (Math.PI / 180);
            const testX = Math.max(0, Math.min(worldWidth - mammal.w, fromX + Math.cos(radians) * scanDistance));
            const testY = Math.max(0, Math.min(worldHeight - mammal.h, fromY + Math.sin(radians) * scanDistance));

            if (!isWaterAt(testX, testY, mammal, heightMap, waterMax)) {
                return candidateAngle;
            }
        }
    }
    return fallbackAngle + globalThis.randomInt(-45, 45);
}

 export function updateMammalOneFrame(mammal, movementConfig) {
    const heightMap = movementConfig.heightMap;
    const waterMax = movementConfig.waterMax;
    const prevX = mammal.x;
    const prevY = mammal.y;
    mammal.angle += globalThis.randomInt(-90, 90) * 0.35;

    const radians = mammal.angle * (Math.PI / 180);
    mammal.x += Math.cos(radians) * mammal.speed;
    mammal.y += Math.sin(radians) * mammal.speed;

    mammal.x = Math.max(0, Math.min(movementConfig.world.width - mammal.w, mammal.x));
    mammal.y = Math.max(0, Math.min(movementConfig.world.height - mammal.h, mammal.y));

    if (isWaterAt(mammal.x, mammal.y, mammal, heightMap, waterMax)) {
        mammal.x = prevX;
        mammal.y = prevY;
        mammal.angle = findLandEscapeAngle(mammal, prevX, prevY, mammal.angle + 180, heightMap, waterMax, movementConfig.world);
    }

    return mammal;
}