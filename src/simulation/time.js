
let tick = 0;
const BASE_YEAR = 2025;
const DEFAULT_LOCALE = "sv-SE";

let monthFormatter;
let monthFormatterLocale;
let dateFormatter;
let dateFormatterLocale;
let timeFormatter;
let timeFormatterLocale;

function getLocale() {
    const configuredLocale = globalThis.SIM?.i18n?.locale || DEFAULT_LOCALE;
    const language = String(configuredLocale).toLowerCase().split("-")[0];
    const texts = globalThis.SIM?.i18n?.texts || {};

    // Keep date/time language in sync with the selected UI text language.
    if (texts[language]) {
        return configuredLocale;
    }

    if (texts.en) {
        return "en-US";
    }

    return DEFAULT_LOCALE;
}

function getMonthFormatter() {
    const locale = getLocale();
    if (!monthFormatter || monthFormatterLocale !== locale) {
        monthFormatter = new Intl.DateTimeFormat(locale, { month: "long" });
        monthFormatterLocale = locale;
    }
    return monthFormatter;
}

function getDateFormatter() {
    const locale = getLocale();
    if (!dateFormatter || dateFormatterLocale !== locale) {
        dateFormatter = new Intl.DateTimeFormat(locale, {
            year: "numeric",
            month: "long",
            day: "2-digit",
        });
        dateFormatterLocale = locale;
    }
    return dateFormatter;
}

function getTimeFormatter() {
    const locale = getLocale();
    if (!timeFormatter || timeFormatterLocale !== locale) {
        timeFormatter = new Intl.DateTimeFormat(locale, {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });
        timeFormatterLocale = locale;
    }
    return timeFormatter;
}

function getSimulationDate() {
    const date = new Date(BASE_YEAR, 0, 1, 0, 0, 0, 0);
    date.setDate(date.getDate() + getDayOfYear());
    date.setMinutes(Math.floor(getTimeOfDay() * 1440));
    return date;
}

function getClockStringFromDate(date) {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function tickTime() {
    tick += 1;
}

function getTimeOfDay() {
    const timeOfDay = (tick % SIM.time.framesPerDay) / SIM.time.framesPerDay;
    return timeOfDay;
}

function getClockString() {
    return getClockStringFromDate(getSimulationDate());
}

function getDayOfYear() {
    return Math.floor(tick / SIM.time.framesPerDay);
}

function getSimulationYearIndex() {
    return Math.floor(getDayOfYear() / 365);
}

function getMonthOfYear() {
    return getSimulationDate().getMonth();
}

function getDayOfYearString() {
    const date = getSimulationDate();

    const day = date.getDate();
    const monthShort = getMonthFormatter().format(date);
    const month = monthShort.charAt(0).toUpperCase() + monthShort.slice(1).replace(".", "");

    return `${day} ${month}`;
}

function getDateTimeString() {
    const date = getSimulationDate();
    const datePart = getDateFormatter().format(date).replace(".", "");
    const timePart = getTimeFormatter().format(date).replace(".", "");
    return `${datePart} ${timePart}`;
}

 function resetTime() {
    tick = 0;
}

 Object.assign(globalThis, {
    tickTime,
    resetTime,
    getTimeOfDay,
    getClockString,
    getDayOfYear,
    getSimulationYearIndex,
    getMonthOfYear,
    getDayOfYearString,
    getDateTimeString,
});

