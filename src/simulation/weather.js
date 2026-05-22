
const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

const BASE_MONTHLY_WEATHER_PROFILES = [

	{ name: "Jan", monthlyTargetMm: 38.5, rainyDaysShare: 0.473, intensityMinMm: 0.2, intensityMaxMm: 7.7, consecutiveRainyDaysAvg: 2.9 },
	{ name: "Feb", monthlyTargetMm: 29.2, rainyDaysShare: 0.439, intensityMinMm: 0.2, intensityMaxMm: 6.6, consecutiveRainyDaysAvg: 2.5 },
	{ name: "Mar", monthlyTargetMm: 27.9, rainyDaysShare: 0.343, intensityMinMm: 0.2, intensityMaxMm: 6.0, consecutiveRainyDaysAvg: 2.2 },
	{ name: "Apr", monthlyTargetMm: 29.5, rainyDaysShare: 0.310, intensityMinMm: 0.2, intensityMaxMm: 8.2, consecutiveRainyDaysAvg: 2.1 },
	{ name: "Maj", monthlyTargetMm: 34.1, rainyDaysShare: 0.334, intensityMinMm: 0.2, intensityMaxMm: 8.3, consecutiveRainyDaysAvg: 2.2 },
	{ name: "Jun", monthlyTargetMm: 58.8, rainyDaysShare: 0.402, intensityMinMm: 0.2, intensityMaxMm: 12.0, consecutiveRainyDaysAvg: 2.4 },
	{ name: "Jul", monthlyTargetMm: 63.2, rainyDaysShare: 0.382, intensityMinMm: 0.3, intensityMaxMm: 12.3, consecutiveRainyDaysAvg: 2.4 },
	{ name: "Aug", monthlyTargetMm: 67.2, rainyDaysShare: 0.422, intensityMinMm: 0.2, intensityMaxMm: 13.9, consecutiveRainyDaysAvg: 2.3 },
	{ name: "Sep", monthlyTargetMm: 50.8, rainyDaysShare: 0.378, intensityMinMm: 0.2, intensityMaxMm: 12.1, consecutiveRainyDaysAvg: 2.7 },
	{ name: "Okt", monthlyTargetMm: 50.4, rainyDaysShare: 0.441, intensityMinMm: 0.3, intensityMaxMm: 10.0, consecutiveRainyDaysAvg: 2.6 },
	{ name: "Nov", monthlyTargetMm: 47.8, rainyDaysShare: 0.517, intensityMinMm: 0.2, intensityMaxMm: 8.0, consecutiveRainyDaysAvg: 3.0 },
	{ name: "Dec", monthlyTargetMm: 48.1, rainyDaysShare: 0.527, intensityMinMm: 0.2, intensityMaxMm: 7.3, consecutiveRainyDaysAvg: 3.0 }
];

function getMonthlyWeatherProfile(monthIndex) {
	const safeIndex = clamp(Math.floor(monthIndex), 0, 11);
	return BASE_MONTHLY_WEATHER_PROFILES[safeIndex];
}

function clamp(value, min, max) {
	return Math.max(min, Math.min(max, value));
}

function convertDayToMonth(dayOfYear) {
	const normalizedDay = ((Math.floor(dayOfYear) % 365) + 365) % 365;
	let remaining = normalizedDay;

	for (let i = 0; i < MONTH_DAYS.length; i++) {
		if (remaining < MONTH_DAYS[i]) {
			return i;
		}
		remaining -= MONTH_DAYS[i];
	}

	return 0;
}

function getDayInMonth(dayOfYear, monthIndex) {
	const normalizedDay = ((Math.floor(dayOfYear) % 365) + 365) % 365;
	let dayOffset = normalizedDay;

	for (let i = 0; i < monthIndex; i++) {
		dayOffset -= MONTH_DAYS[i];
		}
	return dayOffset + 1;
}

function createDefaultWeatherState() {
	return {
		currentMonthIndex: 0,
		dayOfYear: 0,
		isRaining: false,
		rainIntensity: 0,
		dailyRainMm: 0,
		monthlyAccumulatedMm: 0,
		remainingMonthlyTargetMm: 0,
		lastEvaluatedDay: -1,
	};
}

let weatherState = createDefaultWeatherState();


function computeTransitionProbability(profile) {
	const pRainToRain = (profile.consecutiveRainyDaysAvg - 1) / profile.consecutiveRainyDaysAvg;
	const pDryToRain = profile.rainyDaysShare / profile.consecutiveRainyDaysAvg;
	return { pRainToRain, pDryToRain };
}


function computeDailyRainMm(profile) {
	if (weatherState.remainingMonthlyTargetMm <= 0) {
		return 0;
	}
	const monthIndex = weatherState.currentMonthIndex;
	const rawDayInMonth = getDayInMonth(weatherState.dayOfYear, monthIndex);
	const dayInMonth = clamp(rawDayInMonth, 1, MONTH_DAYS[monthIndex]);
	const base = profile.intensityMinMm + Math.random() * (profile.intensityMaxMm - profile.intensityMinMm);
	const daysLeftInMonth = MONTH_DAYS[monthIndex] - dayInMonth + 1;
	const expectedLeft = Math.max(0.1, daysLeftInMonth * profile.rainyDaysShare);
	const neededPerRainDay = weatherState.remainingMonthlyTargetMm / expectedLeft;
	const factor = clamp(neededPerRainDay / base, 0.5, 2);
	return clamp(base * factor , profile.intensityMinMm, Math.min(profile.intensityMaxMm * 1.4, weatherState.remainingMonthlyTargetMm));
}


function resetWeather() {
	weatherState = createDefaultWeatherState();
	return getCurrentWeather();
}

function initWeather() {
	return resetWeather();
}

function updateWeather(input = {}) {

	const parsedDay = Number.isFinite(input.dayOfYear)
		? Math.floor(input.dayOfYear)
		: weatherState.dayOfYear;
	const normalizedDay = ((parsedDay % 365) + 365) % 365;
	const monthIndex = convertDayToMonth(normalizedDay);

	const currentProfile = getMonthlyWeatherProfile(monthIndex);

	// Idempotent update to avoid duplicate monthly/day accumulation in one sim day.
	if (normalizedDay === weatherState.lastEvaluatedDay) {
		return getCurrentWeather();
	}
	const isNewMonth = monthIndex !== weatherState.currentMonthIndex;

	if (isNewMonth) {
		weatherState.monthlyAccumulatedMm = 0;
	}

	weatherState.dayOfYear = normalizedDay;
	weatherState.currentMonthIndex = monthIndex;

	weatherState.remainingMonthlyTargetMm =
		Math.max(0, currentProfile.monthlyTargetMm - weatherState.monthlyAccumulatedMm);

	weatherState.lastEvaluatedDay = normalizedDay;

	const { pRainToRain, pDryToRain } = computeTransitionProbability(currentProfile);

	const transitionProbability = weatherState.isRaining
		? pRainToRain
		: pDryToRain;

	weatherState.isRaining = Math.random() < transitionProbability;

	weatherState.dailyRainMm = weatherState.isRaining
	? computeDailyRainMm(currentProfile) 
		: 0;
	weatherState.rainIntensity = weatherState.dailyRainMm;
	weatherState.monthlyAccumulatedMm += weatherState.dailyRainMm;
	weatherState.remainingMonthlyTargetMm = Math.max(0, currentProfile.monthlyTargetMm - weatherState.monthlyAccumulatedMm);

	return getCurrentWeather();
}

function getCurrentWeather() {
	return Object.freeze({ ...weatherState });
}

Object.assign(globalThis, {
	initWeather,
	resetWeather,
	updateWeather,
	getCurrentWeather,
});
