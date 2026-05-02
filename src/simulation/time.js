
let tick = 0;

function tickTime() {
    tick += 1;
}

function getTimeOfDay() {
    const timeOfDay = (tick % SIM.dayNightCycle.framesPerDay) / SIM.dayNightCycle.framesPerDay; // 0 = midnight, 0.5 = noon, 1 = next midnight
    return timeOfDay;
}

function getDayNightModifiers() {
    const timeOfDay = getTimeOfDay();
    const dayModifier = (1 - Math.cos(timeOfDay * 2 * Math.PI)) / 2;
    const darknessLevel = (1 - dayModifier) * SIM.dayNightCycle.maxDarkness;
    const grassGrowthModifier = SIM.dayNightCycle.nightGrassGrowthMultiplier + (1 - SIM.dayNightCycle.nightGrassGrowthMultiplier) * dayModifier;
    const rabbitSpeedModifier = SIM.dayNightCycle.nightRabbitSpeedMultiplier + (1 - SIM.dayNightCycle.nightRabbitSpeedMultiplier) * dayModifier;
    return { grassGrowthModifier, rabbitSpeedModifier, darknessLevel };
}

function getClockString() {
    const totalMinutes = Math.floor(getTimeOfDay() * 1440); // 1440 = 24 * 60
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

 function drawDayNightOverlay(ctx) {
    const { darknessLevel } = getDayNightModifiers();
    ctx.save();
    ctx.fillStyle = `rgba(0, 0, 0, ${darknessLevel.toFixed(2)})`;
    ctx.fillRect(0, 0, globalThis.WIDTH, globalThis.HEIGHT);
    ctx.restore();
}

 function resetTime() {
    tick = 0;
}

 Object.assign(globalThis, {
    tickTime,
    resetTime,
    getTimeOfDay,
    getDayNightModifiers,
    getClockString,
    drawDayNightOverlay,
});