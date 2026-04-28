const SIM = {
world: {
width: 800,
height: 600,
border: 10,
},
grass: {
initialCount: 810,
growthPerTick: 0.1,
eatenHeightFactor: 0.1,
minEatenHeight: 1,
heightMin: 30,
heightMax: 40,
widthMin: 15,
widthMax: 20,
},
rabbits: {
initialCount: 10,
widthMin: 5,
widthMax: 10,
heightMin: 15,
heightMax: 20,
speedMin: 1,
speedMax: 3,
jumpChance: 0.05,
jumpPowerMin: 2,
jumpPowerMax: 5,
eatChance: 0.5,
},
background: {
pixelSize: 2,
colors: [
[38, 7, 1],
[47, 14, 7],
[56, 22, 13],
],
},
};