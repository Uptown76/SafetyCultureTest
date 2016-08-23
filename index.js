"use strict";

const sprintf = require("sprintf-js").sprintf;
const keypress = require("keypress");
const TrafficLightController = require("./lib/trafficLightController");

// Stackoverflow solution.
// http://stackoverflow.com/questions/5539028/converting-seconds-into-hhmmss/5539081#5539081
function formatTime(time) {
    time = Number(time);
    var h = Math.floor(time / 3600);
    var m = Math.floor(time % 3600 / 60);
    var s = Math.floor(time % 3600 % 60);
    return ((h > 0 ? h + ":" + (m < 10 ? "0" : "") : "") + m + ":" + (s < 10 ? "0" : "") + s);
}

keypress(process.stdin);

console.log("-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=");
console.log("               \x1b[31mTraffic \x1b[33mLight \x1b[32mController                   ");
console.log("       \x1b[0mPress any key to start and stop the controller     ");
console.log("\x1b[0m-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\n");

const controller = new TrafficLightController();
controller.on("change", function(state) {
    console.log(sprintf("%s\t%s - %s", formatTime(state.time), state.colour.NS, state.colour.EW));
});

let isRunning = false;
process.stdin.on("keypress", function (ch, key) {
    if (!isRunning) {
        console.log(sprintf("Time\tNS - EW Lights"));
        controller.start();
    } else {
        process.exit();
    }
    isRunning = !isRunning;
});

process.stdin.setRawMode(true);
process.stdin.resume();
