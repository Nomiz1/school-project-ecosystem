const WIDTH = 800;
const HEIGHT = 600;
const Border = 10;

/*Why this is important in the project:

It makes the world feel different each time the simulation starts.
It is used to place grass and rabbits at random positions.
It is used to give rabbits and grass random sizes or speeds.
Without it, everything would appear in the same place with the same values every run.
*/
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
