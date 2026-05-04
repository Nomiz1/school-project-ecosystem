
let tick = 0;

function tickTime() {
    tick += 1;
}

function getTimeOfDay() {
    const timeOfDay = (tick % SIM.time.framesPerDay) / SIM.time.framesPerDay;
    return timeOfDay;
}

function getClockString() {
    const totalMinutes = Math.floor(getTimeOfDay() * 1440); // 1440 = 24 * 60
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'];
const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function getDayOfYear() {
    return Math.floor(tick / SIM.time.framesPerDay);
}

function getDayOfYearString() {
    const dayIndex = getDayOfYear() % 365;
    let remaining = dayIndex;
    for (let i = 0; i < MONTH_DAYS.length; i++) {
        if (remaining < MONTH_DAYS[i]) {
            return `${remaining + 1} ${MONTH_NAMES[i]}`;
        }
        remaining -= MONTH_DAYS[i];
    }
    return `1 Jan`;
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
});