const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

const MONTHLY_WEATHER_PROFILES = [

	{ name: "Jan", monthlyTargetMm: 45, rainyDaysShare: 0.45, intensityMinMm: 0.6, intensityMaxMm: 5.0 },
	{ name: "Feb", monthlyTargetMm: 35, rainyDaysShare: 0.42, intensityMinMm: 0.6, intensityMaxMm: 4.5 },
	{ name: "Mar", monthlyTargetMm: 38, rainyDaysShare: 0.40, intensityMinMm: 0.6, intensityMaxMm: 4.8 },
	{ name: "Apr", monthlyTargetMm: 35, rainyDaysShare: 0.38, intensityMinMm: 0.6, intensityMaxMm: 4.5 },
	{ name: "Maj", monthlyTargetMm: 45, rainyDaysShare: 0.40, intensityMinMm: 0.7, intensityMaxMm: 5.5 },
	{ name: "Jun", monthlyTargetMm: 60, rainyDaysShare: 0.43, intensityMinMm: 0.8, intensityMaxMm: 7.0 },
	{ name: "Jul", monthlyTargetMm: 72, rainyDaysShare: 0.45, intensityMinMm: 0.9, intensityMaxMm: 8.0 },
	{ name: "Aug", monthlyTargetMm: 75, rainyDaysShare: 0.46, intensityMinMm: 0.9, intensityMaxMm: 8.0 },
	{ name: "Sep", monthlyTargetMm: 60, rainyDaysShare: 0.43, intensityMinMm: 0.8, intensityMaxMm: 7.0 },
	{ name: "Okt", monthlyTargetMm: 58, rainyDaysShare: 0.44, intensityMinMm: 0.7, intensityMaxMm: 6.5 },
	{ name: "Nov", monthlyTargetMm: 57, rainyDaysShare: 0.47, intensityMinMm: 0.7, intensityMaxMm: 6.0 },
	{ name: "Dec", monthlyTargetMm: 52, rainyDaysShare: 0.48, intensityMinMm: 0.6, intensityMaxMm: 5.5 }
	//Värdena ovan är placeholders tills data från SMHI kan användas i koden.
];

function getMonthlyWeatherProfile(monthIndex) {
	const safeIndex = clamp(Math.floor(monthIndex), 0, 11);
	return MONTHLY_WEATHER_PROFILES[safeIndex];
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
		transitionLockUntilDay: -1,
	};
}

let weatherState = createDefaultWeatherState();

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
	const monthIndex = Number.isFinite(input.monthIndex)
		? clamp(Math.floor(input.monthIndex), 0, 11)
		: convertDayToMonth(normalizedDay);

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
