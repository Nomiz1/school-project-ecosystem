import { beforeAll, test, expect, vi } from "vitest";

import "../src/simulation/simulation-constants.js";
import "../src/simulation/utils.js";

test("randomInt should return a number between min and max", () => {
    const min = 1;
    const max = 10;
    const result = randomInt(min, max);
    expect(result).toBeGreaterThanOrEqual(min);
    expect(result).toBeLessThanOrEqual(max);
});

test("randomInt should return an integer", () => {
    const min = 1;
    const max = 10;
    const result = randomInt(min, max);
    expect(Number.isInteger(result)).toBe(true);
});

test("randomint should return the exact value when min and max are the same", () => {
    const min = 5;
    const max = 5;
    const result = randomInt(min, max);
    expect(result).toBe(min);
});