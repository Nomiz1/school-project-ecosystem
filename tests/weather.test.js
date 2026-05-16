import { beforeEach, expect, test } from "vitest";

import "../src/simulation/weather.js";

// Stockholm 1991-2020 climate normals (mm precipitation per month)
const STOCKHOLM_CLIMATE_NORMALS = [
  37.0,  // January
  29.4,  // February
  27.3,  // March
  29.2,  // April
  34.0,  // May
  61.7,  // June
  61.5,  // July
  66.2,  // August
  53.3,  // September
  51.4,  // October
  47.6,  // November
  47.8,  // December
];

function getExpectedClimateNormal(monthIndex) {
  return STOCKHOLM_CLIMATE_NORMALS[monthIndex];
}

beforeEach(() => {
  globalThis.resetWeather();
});

test("initWeather should initialize default weather state", () => {
  const state = globalThis.initWeather();

  expect(state).toMatchObject({
    currentMonthIndex: 0,
    dayOfYear: 0,
    isRaining: false,
    rainIntensity: 0,
    dailyRainMm: 0,
    monthlyAccumulatedMm: 0,
    remainingMonthlyTargetMm: 0,
    lastEvaluatedDay: -1,
    transitionLockUntilDay: -1,
  });
});

test("resetWeather should reset mutated weather state", () => {
  globalThis.updateWeather({ dayOfYear: 120, monthIndex: 3 });

  const resetState = globalThis.resetWeather();

  expect(resetState.dayOfYear).toBe(0);
  expect(resetState.currentMonthIndex).toBe(0);
  expect(resetState.lastEvaluatedDay).toBe(-1);
});

test("getCurrentWeather should return an immutable snapshot", () => {
  const snapshot = globalThis.getCurrentWeather();

  expect(Object.isFrozen(snapshot)).toBe(true);
  expect(() => {
    snapshot.dayOfYear = 22;
  }).toThrow();
});

test("updateWeather should be idempotent for the same day", () => {
  const first = globalThis.updateWeather({ dayOfYear: 42, monthIndex: 2 });
  const second = globalThis.updateWeather({ dayOfYear: 42, monthIndex: 10 });

  expect(first.lastEvaluatedDay).toBe(42);
  expect(second.lastEvaluatedDay).toBe(42);
  expect(second.currentMonthIndex).toBe(2);
});

test("updateWeather should fallback safely when called without input", () => {
  globalThis.initWeather();

  const state = globalThis.updateWeather();

  expect(state).toMatchObject({
    dayOfYear: 0,
    currentMonthIndex: 0,
    rainIntensity: 0,
    dailyRainMm: 0,
  });
  expect(typeof state.isRaining).toBe("boolean");
});

test("Month 0 (January) should have correct weather profile", () => {
  const state = globalThis.updateWeather({ dayOfYear: 0 });
  const expectedJanuaryTargetMm = getExpectedClimateNormal(0);

  expect(state.currentMonthIndex).toBe(0);
  expect(state.remainingMonthlyTargetMm).toBeCloseTo(expectedJanuaryTargetMm);
});

test("updateWeather should correctly transition between months", () => {
    const state = globalThis.updateWeather({ dayOfYear: 31 });

    expect(state.currentMonthIndex).toBe(1);

});

test("updateWeather should correctly handle dayOfYear overflow", () => {
    const state = globalThis.updateWeather({ dayOfYear: 200, monthIndex: 11 });
    const expectedDecemberTargetMm = getExpectedClimateNormal(11);

    expect(state.currentMonthIndex).toBe(11);
    expect(state.remainingMonthlyTargetMm).toBeCloseTo(expectedDecemberTargetMm);
});

test("weather monthly target should be data-driven and finite", () => {
  const januaryState = globalThis.updateWeather({ dayOfYear: 0, monthIndex: 0 });

  expect(Number.isFinite(januaryState.remainingMonthlyTargetMm)).toBe(true);
  expect(januaryState.remainingMonthlyTargetMm).toBeGreaterThan(0);
});

test("updateWeather should correctly handle negative monthIndex", () => {
    const state = globalThis.updateWeather({ monthIndex: -5 });
    expect(state.currentMonthIndex).toBe(0);
});

test("updateWeather should correctly handle monthIndex overflow", () => {
    const state = globalThis.updateWeather({ monthIndex: 99 });
    expect(state.currentMonthIndex).toBe(11);
});

test("updateWeather should not change month if dayOfYear is the same but monthIndex is different", () => {
    const state = globalThis.updateWeather({ dayOfYear: 42, monthIndex: 2 });
    const secondState = globalThis.updateWeather({ dayOfYear: 42, monthIndex: 10 });
    
    expect(state.currentMonthIndex).toBe(2);
    expect(secondState.currentMonthIndex).toBe(2);
});

test("resetWeather should reset weather data", () => {
  globalThis.updateWeather({ dayOfYear: 120, monthIndex: 3 });

  const resetState = globalThis.resetWeather();

  expect(resetState.remainingMonthlyTargetMm).toBe(0);
  expect(resetState.lastEvaluatedDay).toBe(-1);
});
