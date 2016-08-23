// NOTE: Using the object oriented State pattern rather than a monolithic Finite State Machine
// in this simple case to get rid of a few ifs and thens.

// Need to consider the system as a whole.
// The states of the NS lights are coupled to the EW lights.

// States and their transitions as follows:
// ╔═══════╦════════╦════════╗
// ║ State ║   NS   ║   EW   ║
// ╠═══════╬════════╬════════╣
// ║     1 ║ RED    ║ GREEN  ║
// ║     2 ║ RED    ║ ORANGE ║
// ║     3 ║ GREEN  ║ RED    ║
// ║     4 ║ ORANGE ║ RED    ║
// ╚═══════╩════════╩════════╝

// R1 - O1 - G1 are the microstates of NS lights.
// R2 - O2 - G2 are the microstates of EW lights.
// ╔═══════╦════╦════╦════╦════╦════╦════╗
// ║ State ║ R1 ║ O1 ║ G1 ║ R2 ║ O2 ║ G2 ║
// ╠═══════╬════╬════╬════╬════╬════╬════╣
// ║     1 ║  1 ║  0 ║  0 ║  0 ║  0 ║  1 ║
// ║     2 ║  1 ║  0 ║  0 ║  0 ║  1 ║  0 ║
// ║     3 ║  0 ║  0 ║  1 ║  1 ║  0 ║  0 ║
// ║     4 ║  0 ║  1 ║  0 ║  1 ║  0 ║  0 ║
// ╚═══════╩════╩════╩════╩════╩════╩════╝

// Probably being a tad pedantic here - limiting the scope to within the self-executing function.
module.exports = (function() {
    "use strict";

    var EventEmitter = require("events").EventEmitter;

    // NOTE: The following state objects are private to this module. The user of this module
    // only really needs to know the state description and not have access to the state object.
    const RedGreenState = function(controller) {
        this.colour = { NS: "Red", EW: "Green" };
        this.change = function() {
            setTimeout(() => {
                controller.setState(new RedOrangeState(controller));
            }, controller.standardTransitionTime);
        };
    };

    const RedOrangeState = function(controller) {
        this.colour = { NS: "Red", EW: "Orange" };
        this.change = function() {
            setTimeout(() => {
                controller.setState(new GreenRedState(controller));
            }, controller.orangeTransitionTime);
        };
    };

    const GreenRedState = function(controller) {
        this.colour = { NS: "Green", EW: "Red" };
        this.change = function() {
            setTimeout(() => {
                controller.setState(new OrangeRedState(controller));
            }, controller.standardTransitionTime);
        };
    };

    const OrangeRedState = function(controller) {
        this.colour = { NS: "Orange", EW: "Red" };
        this.change = function() {
            setTimeout(() => {
                controller.setState(new RedGreenState(controller));
            }, controller.orangeTransitionTime);
        };
    };

    function TrafficLightController(transitionTime, orangeTransitionTime) {
        this.standardTransitionTime = transitionTime || 300000;
        this.orangeTransitionTime = orangeTransitionTime || 30000;

        if (typeof this.standardTransitionTime != "number" ||
            typeof this.orangeTransitionTime != "number" ) {
            throw new TypeError("Arguments must be integers.");
        }

        this.state = new RedGreenState(this);

        // NOTE: do we need self-adjusting timers in the state objects as we will be running the
        // simulation over a long period.
        this.elapsedTime = 0;
    }

    // Notify the listener that the state of the traffic light system has changed.
    // Keep this method private.
    const emitStateChange = function() {
        // As this function is called in the constructor, the listener has not yet subscribed
        // to recieve the "change" event. Wait one tick of the Node event loop for this to occur
        // so the event can be processed correctly.
        process.nextTick(() => {
            this.emit("change", { time: this.elapsedTime, colour: this.state.colour });
        });
    };

    // TODO: make this private
    TrafficLightController.prototype.setState = function(state) {
        this.elapsedTime = (new Date() - this.startTime) / 1000;
        this.state = state;
        emitStateChange.call(this);

        // NOTE: Normally these recursive calls will exceed the maximum call stack size.
        // However the setTimeouts in the the callee "change" method act as process.nextTick()
        // i.e Node has time to clear the stack.
        state.change();
    };

    TrafficLightController.prototype.start = function() {
        // Emit the initial state to the listener
        if (this.elapsedTime === 0) {
            this.startTime = new Date();
            emitStateChange.call(this);
        }

        this.state.change();
    };

    // Inherit from EventEmitter
    TrafficLightController.prototype.__proto__ = EventEmitter.prototype;

    return TrafficLightController;
})();