
let tick = 0;
const BASE_YEAR = 2025; // Non-leap year keeps a stable 365-day cycle.
const DEFAULT_LOCALE = "sv-SE";

let monthFormatter;
let monthFormatterLocale;

function getLocale() {
    return globalThis.SIM?.i18n?.locale || DEFAULT_LOCALE;
}

function getMonthFormatter() {
    const locale = getLocale();
    if (!monthFormatter || monthFormatterLocale !== locale) {
        monthFormatter = new Intl.DateTimeFormat(locale, { month: "long" });
        monthFormatterLocale = locale;
    }
    return monthFormatter;
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

function getDayOfYearString() {
    const date = getSimulationDate();

    const day = date.getDate();
    const monthShort = getMonthFormatter().format(date);
    const month = monthShort.charAt(0).toUpperCase() + monthShort.slice(1).replace(".", "");

    return `${day} ${month}`;
}

function getDateTimeString() {
    const date = getSimulationDate();
    const year = date.getFullYear();
    const monthName = getMonthFormatter().format(date).replace(".", "");
    const day = String(date.getDate()).padStart(2, "0");
    const time = getClockStringFromDate(date);
    return `${year}/${monthName}/${day} ${time}`;
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
    getDayOfYearString,
    getDateTimeString,
});

