function isLightGrassNearWater(x, y) {
	const heightMap = globalThis.heightMap;
	const WATER_MAX = globalThis.SIM.terrain.waterMax;
	const GRASS_NEAR_WATER = globalThis.SIM.terrain.grassNearWater;
	for (let distanceY = -GRASS_NEAR_WATER; distanceY <= GRASS_NEAR_WATER; distanceY++) {
		for (let distanceX = -GRASS_NEAR_WATER; distanceX <= GRASS_NEAR_WATER; distanceX++) {
			const neighborX = x + distanceX;
			const neighborY = y + distanceY;
			if (neighborX >= 0 && neighborX < heightMap[0].length && neighborY >= 0 && neighborY < heightMap.length) {
				if (heightMap[neighborY][neighborX] <= WATER_MAX) {
					return true;
				}
			}
		}
	}
	return false;
}

function rainAffectsTerrain(x, y, rainAmount = 0) {
	const DARK_GRASS_MAX = globalThis.SIM.terrain.darkGrassMax;
	const floor = DARK_GRASS_MAX - 0.01;
	const heightMap = globalThis.heightMap;
	const raw = heightMap[y][x];

	if (raw > DARK_GRASS_MAX && rainAmount > 0 && rainAmount <= globalThis.SIM.weather.lightRainMaxMm) {
		const delta = (rainAmount / globalThis.SIM.weather.lightRainMaxMm) * 0.002;
		heightMap[y][x] = Math.max(floor, raw - delta);
		globalThis.redrawTerrainPixel(x, y);
	}
	if (raw > DARK_GRASS_MAX && rainAmount > globalThis.SIM.weather.lightRainMaxMm && rainAmount <= globalThis.SIM.weather.middleRainMaxMm) {
		const delta = (rainAmount / globalThis.SIM.weather.middleRainMaxMm) * 0.004;
		heightMap[y][x] = Math.max(floor, raw - delta);
		globalThis.redrawTerrainPixel(x, y);
	}
	if (raw > DARK_GRASS_MAX && rainAmount > globalThis.SIM.weather.middleRainMaxMm) {
		const delta = (rainAmount / globalThis.SIM.weather.darkRainMaxMm) * 0.006;
		heightMap[y][x] = Math.max(floor, raw - delta);
		globalThis.redrawTerrainPixel(x, y);
	}
}

function temperatureGrowthFactor(tempC = 0) {
	return Math.max(0, Math.pow(2, 0.05 * tempC)-1); // y=(2^0.05x)-1 
}

function temperatureAffectsTerrain (x, y, tempC) {
	const heightMap = globalThis.heightMap;
    const WATER_MAX = globalThis.SIM.terrain.waterMax;
    const DARK_GRASS_MAX = globalThis.SIM.terrain.darkGrassMax;
    const floor = DARK_GRASS_MAX - 0.01;

	const raw = heightMap[y][x];
	if (raw <= WATER_MAX) return;

	const growthFactor = temperatureGrowthFactor(tempC);

	const delta = Math.min(0.002, growthFactor * 0.0012);

	heightMap[y][x] = Math.max(floor, raw - delta);
	globalThis.redrawTerrainPixel(x, y);
}

function lightGrassBecomesDarkGrass(x, y) {
	const heightMap = globalThis.heightMap;
	const DARK_GRASS_MAX = globalThis.SIM.terrain.darkGrassMax;
	const raw = heightMap[y][x];

	if (raw > DARK_GRASS_MAX && isLightGrassNearWater(x, y)) {
		heightMap[y][x] = DARK_GRASS_MAX - 0.01;
		globalThis.redrawTerrainPixel(x, y);
	}
}

Object.assign(globalThis, {
	isLightGrassNearWater,
	rainAffectsTerrain,
	temperatureAffectsTerrain,
	lightGrassBecomesDarkGrass,
});
