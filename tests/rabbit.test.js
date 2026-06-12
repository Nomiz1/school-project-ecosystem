import { beforeEach, expect, test } from "vitest";

import "../src/simulation/simulation-constants.js";
import "../src/simulation/utils.js";
import "../src/simulation/rabbit/state.js";
import "../src/simulation/rabbit/reproduction.js";

beforeEach(() => {
	globalThis.setRabbits([]);
});

test("rabbitBirth creates a baby with speed within the parents' speed range", () => {
	const motherRabbit = {
		x: 10,
		y: 10,
		w: 2,
		h: 2,
		speed: 2,
		pregnant: true,
		pregnancyTimer: 1,
		pregnancyLitterSize: 4,
		pregnancySpeedMin: 2,
		pregnancySpeedMax: 5,
	};

	globalThis.getRabbits().push(motherRabbit);

	globalThis.rabbitBirth();

	expect(globalThis.getRabbits()).toHaveLength(5);

	for (const babyRabbit of globalThis.getRabbits().slice(1)) {
		expect(babyRabbit.speed).toBeGreaterThanOrEqual(2);
		expect(babyRabbit.speed).toBeLessThanOrEqual(5);
	}
});
