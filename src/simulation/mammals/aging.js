
export function agesOneFrame(mammal) {
    const framesPerDay = globalThis.SIM.time.framesPerDay;
    const daysPerYear = 365;
    mammal.age += 1 / (framesPerDay * daysPerYear);
}