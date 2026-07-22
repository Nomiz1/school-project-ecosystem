
export function mammalLosesHunger(mammal, hungerConfig) {
    mammal.hunger = Math.max(0, mammal.hunger - hungerConfig.hungerLossPerFrame);
}

export function mammalDies(mammal, fatalityFn) {
    return fatalityFn(mammal) || mammal.hunger <= 0;
}
