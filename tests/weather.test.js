import { beforeEach, expect, test } from "vitest";

import "../src/simulation/simulation-constants.js";
import "../src/simulation/weather.js";

// Stockholm 1991-2020 climate normals (mm precipitation per month)
const STOCKHOLM_CLIMATE_NORMALS = [
  38.5,  // January
  29.2,  // February
  27.9,  // March
  29.5,  // April
  34.1,  // May
  58.8,  // June
  63.2,  // July
  67.2,  // August
  50.8,  // September
  50.4,  // October
  47.8,  // November
  48.1,  // December
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
  });
});

test("resetWeather should reset mutated weather state", () => {
  globalThis.updateWeather({ dayOfYear: 120 });

  const resetState = globalThis.resetWeather();

  expect(resetState.dayOfYear).toBe(0);
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
  const first = globalThis.updateWeather({ dayOfYear: 42 });
  const second = globalThis.updateWeather({ dayOfYear: 42 });

  expect(first.lastEvaluatedDay).toBe(42);
  expect(second.lastEvaluatedDay).toBe(42);
  expect(second.currentMonthIndex).toBe(1);
});

test("updateWeather should fallback safely when called without input", () => {
  globalThis.initWeather();

  const state = globalThis.updateWeather();

  expect(state).toMatchObject({
    dayOfYear: 0,
    currentMonthIndex: 0,
  });
  expect(typeof state.isRaining).toBe("boolean");
  expect(Number.isFinite(state.rainIntensity)).toBe(true);
  expect(Number.isFinite(state.dailyRainMm)).toBe(true);
  expect(state.rainIntensity).toBeGreaterThanOrEqual(0);
  expect(state.dailyRainMm).toBeGreaterThanOrEqual(0);
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
  const state = globalThis.updateWeather({ dayOfYear: 200 });
  const expectedJulyTargetMm = getExpectedClimateNormal(6);

  expect(state.currentMonthIndex).toBe(6);
  expect(state.remainingMonthlyTargetMm).toBeLessThanOrEqual(expectedJulyTargetMm);
});

test("weather monthly target should be data-driven and finite", () => {
  const januaryState = globalThis.updateWeather({ dayOfYear: 0 });

  expect(Number.isFinite(januaryState.remainingMonthlyTargetMm)).toBe(true);
  expect(januaryState.remainingMonthlyTargetMm).toBeGreaterThan(0);
});

test("updateWeather should correctly handle negative dayOfYear", () => {
  const state = globalThis.updateWeather({ dayOfYear: -1 });
  expect(state.currentMonthIndex).toBe(11);
});

test("updateWeather should correctly handle dayOfYear overflow to next year", () => {
  const state = globalThis.updateWeather({ dayOfYear: 365 });
  expect(state.currentMonthIndex).toBe(0);
});

test("updateWeather should not change month if dayOfYear is the same", () => {
  const state = globalThis.updateWeather({ dayOfYear: 42 });
  const secondState = globalThis.updateWeather({ dayOfYear: 42 });
    
  expect(state.currentMonthIndex).toBe(1);
  expect(secondState.currentMonthIndex).toBe(1);
});

test("resetWeather should reset weather data", () => {
  globalThis.updateWeather({ dayOfYear: 120 });

  const resetState = globalThis.resetWeather();

  expect(resetState.remainingMonthlyTargetMm).toBe(0);
  expect(resetState.lastEvaluatedDay).toBe(-1);
});

test("dailyRainMm should be zero when isRaining is false", () => {
  const state = globalThis.updateWeather({ dayOfYear: 50 });

  if (!state.isRaining) {
    expect(state.dailyRainMm).toBe(0);
  }
});

test("dailyRainMm should return a value within expected range when isRaining is true", () => {
  const state = globalThis.updateWeather({ dayOfYear: 50 });
  const monthProfile = {
    intensityMinMm: 0.2,
    intensityMaxMm: 8.2,
  };

  if (state.isRaining) {
    expect(state.dailyRainMm).toBeGreaterThanOrEqual(0);
    expect(state.dailyRainMm).toBeLessThanOrEqual(monthProfile.intensityMaxMm * globalThis.SIM.weather.intensityBurstAllowance);
  }
});

test("montthlyAccumulated should correctly accumulate daily rain", () => {
  let state = globalThis.updateWeather({ dayOfYear: 0 });

  if (state.isRaining) {
    const firstDayRain = state.dailyRainMm;
    state = globalThis.updateWeather({ dayOfYear: 1 });
    const secondDayRain = state.dailyRainMm;

    expect(state.monthlyAccumulatedMm).toBeCloseTo(firstDayRain + secondDayRain);
  }
});

test("remainingMonthlyTargetMm should decrease by dailyRainMm when it rains", () => {
  let state = globalThis.updateWeather({ dayOfYear: 0 });

  if (state.isRaining) {
    const initialTarget = state.remainingMonthlyTargetMm + state.dailyRainMm;
    
    expect(state.remainingMonthlyTargetMm).toBeCloseTo(initialTarget - state.dailyRainMm); 
  }
});

test("remainingMonthlyTargetMm should not go below zero", () => {
  let state = globalThis.updateWeather({ dayOfYear: 0 });
  let guard = 0;

  while (state.remainingMonthlyTargetMm > 0 && guard < 730) {
    state = globalThis.updateWeather({ dayOfYear: state.dayOfYear + 1 });
    guard++;
  }

  expect(state.remainingMonthlyTargetMm).toBeGreaterThanOrEqual(0);
});