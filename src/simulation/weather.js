
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
let weatherRng = Math.random;


function computeTransitionProbability(profile) {
	const pRainToRain = (profile.consecutiveRainyDaysAvg - 1) / profile.consecutiveRainyDaysAvg;
	const pDryToRain = profile.rainyDaysShare / profile.consecutiveRainyDaysAvg;
	return { pRainToRain, pDryToRain };
}


function computeDailyRainMm(profile) {
	
	const base = profile.intensityMinMm + weatherRng() * (profile.intensityMaxMm - profile.intensityMinMm);
	const safeMontlyTarget = Math.max(0.1, Number(profile.monthlyTargetMm) || 0);
	const deficitFactor = (safeMontlyTarget - weatherState.monthlyAccumulatedMm) / safeMontlyTarget;
	const correction = clamp( 1 + deficitFactor * 0.25, 0.8, 1.25);
	const maxAllowed = profile.intensityMaxMm * globalThis.SIM.weather.intensityBurstAllowance;
	return clamp(base * correction, profile.intensityMinMm, maxAllowed);
}

function setWeatherRng(rngFn) {
	if (typeof rngFn === "function") {
		weatherRng = rngFn;
	}
}

function resetWeatherRng() {
	weatherRng = Math.random;
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
		currentProfile.monthlyTargetMm - weatherState.monthlyAccumulatedMm;

	weatherState.lastEvaluatedDay = normalizedDay;

	const { pRainToRain, pDryToRain } = computeTransitionProbability(currentProfile);

	const transitionProbability = weatherState.isRaining
		? pRainToRain
		: pDryToRain;

	weatherState.isRaining = weatherRng() < transitionProbability;

	weatherState.dailyRainMm = weatherState.isRaining
	? computeDailyRainMm(currentProfile) 
	: 0;
	weatherState.rainIntensity = weatherState.dailyRainMm;
	weatherState.monthlyAccumulatedMm += weatherState.dailyRainMm;
	weatherState.remainingMonthlyTargetMm = currentProfile.monthlyTargetMm - weatherState.monthlyAccumulatedMm;

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
	setWeatherRng,
	resetWeatherRng,
});
