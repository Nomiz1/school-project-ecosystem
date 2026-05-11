import "./simulation/simulation-constants.js";
import "./simulation/utils.js";
import "./simulation/terrain.js";
import "./simulation/rabbit.js";
import "./simulation/time.js";
import { resetButtonHandler, initWorld, updateSimulation } from "./simulation/app.js";

resetButtonHandler();
initWorld();
window.requestAnimationFrame(updateSimulation);