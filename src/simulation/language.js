const DEFAULT_LOCALE = "sv-SE";

const browserLocale =
	typeof navigator !== "undefined"
		? navigator.languages?.[0] || navigator.language || DEFAULT_LOCALE
		: DEFAULT_LOCALE;

const i18nTexts = {
	en: {
		pageTitle: "School Ecosystem Simulation",
		appTitle: "Ecosystem Simulation",
		subtitle: "By: Zimon Roos",
		rainNo: "Is it raining? No",
		rainYes: "Is it raining? Yes",
		rabbitCountLabel: "Rabbits",
		timeLabel: "Time",
		dayLabel: "Day",
		dateTimeLabel: "Date",
		resetButton: "Reset",
		xLabel: "X",
		yLabel: "Y",
		terrainUnknown: "?",
		terrainWater: "Water",
		terrainGrass: "Grass",
		terrainDryGrass: "Dry grass",
		canvasAria: "Ecosystem simulation canvas",
	},
	sv: {
		pageTitle: "Skolans ekosystemsimulering",
		appTitle: "Ekosystemsimulering",
		subtitle: "Av: Zimon Roos",
		rainNo: "Regnar det? Nej",
		rainYes: "Regnar det? Ja",
		rabbitCountLabel: "Kaniner",
		timeLabel: "Tid",
		dayLabel: "Dag",
		dateTimeLabel: "Datum",
		resetButton: "Återställ",
		xLabel: "X",
		yLabel: "Y",
		terrainUnknown: "?",
		terrainWater: "Vatten",
		terrainGrass: "Gräs",
		terrainDryGrass: "Torrt gräs",
		canvasAria: "Canvas for ekosystemsimulering",
	},
};

export function getLanguage(locale = globalThis.SIM?.i18n?.locale || browserLocale) {
	return String(locale).toLowerCase().split("-")[0];
}

export function getTexts() {
	const language = getLanguage();
	const texts = globalThis.SIM?.i18n?.texts || i18nTexts;
	return texts[language] || texts.en || {};
}

export function t(key, fallback) {
	const texts = getTexts();
	return texts[key] || fallback;
}

export { browserLocale, i18nTexts, DEFAULT_LOCALE };
