"use strict";

const chai = require("chai");
const sinon = require("sinon");

chai.config.includeStack = true;

const expect = chai.expect;
const assert = chai.assert;

describe("Traffic Light Controller Module", function() {
    let TrafficLightController;
    before(function() {
        TrafficLightController = require("../lib/trafficLightController");
    });

    describe("Constructor", function() {
        it("initialised with default parameters", function() {
            const controller = new TrafficLightController();
            expect(controller.standardTransitionTime).to.equal(300000);
            expect(controller.orangeTransitionTime).to.equal(30000);
        });

        it("should initialise with ONLY numeric parameters", function() {
            expect(() => {
                new TrafficLightController("blah", "whoa");
            }).to.throw(TypeError, "Arguments must be integers.");
        });
    });

    describe("Event Emitter", function() {
        let clock;
        let changeEventSpy
        let controller;
        beforeEach(function() {
            clock = sinon.useFakeTimers();
            changeEventSpy = sinon.spy();
            controller = new TrafficLightController(1000, 500);
            controller.on("change", changeEventSpy);
        });

        afterEach(function() {
            clock.restore();
            changeEventSpy.reset();
            controller = null;
        });

        it("should emit 'change' event", function(done) {
            controller.start();

            process.nextTick(() => {
                sinon.assert.calledOnce(changeEventSpy);
                done();
            });
        });

        it("should emit the initial state in a 'change' event", function(done) {
            controller.start();

            process.nextTick(() => {
                const state = {
                    time: 0,
                    colour: { NS: "Red", EW: "Green" }
                };
                sinon.assert.calledOnce(changeEventSpy);
                sinon.assert.calledWith(changeEventSpy, state);
                done();
            });
        });

        it("red-green state should transition to red-orange state", function(done) {
            controller.start();
            clock.tick(1000);

            process.nextTick(() => {
                const state = {
                    time: 1,
                    colour: { NS: "Red", EW: "Orange" }
                };
                // Account for the initial event that is fired in the constructor
                sinon.assert.calledTwice(changeEventSpy);
                sinon.assert.calledWith(changeEventSpy.lastCall, state);
                done();
            });
        });

        it("red-orange state should transition to green-red state", function(done) {
            controller.start();
            clock.tick(1500);

            process.nextTick(() => {
                const state = {
                    time: 1.5,
                    colour: { NS: "Green", EW: "Red" }
                };
                // Account for the initial event that is fired in the constructor
                sinon.assert.calledThrice(changeEventSpy);
                sinon.assert.calledWith(changeEventSpy.lastCall, state);
                done();
            });
        });

        it("green-red state should transition to orange-red state", function(done) {
            controller.start();
            clock.tick(2500);

            process.nextTick(() => {
                const state = {
                    time: 2.5,
                    colour: { NS: "Orange", EW: "Red" }
                };
                // Account for the initial event that is fired in the constructor
                sinon.assert.callCount(changeEventSpy, 4)
                sinon.assert.calledWith(changeEventSpy.lastCall, state);
                done();
            });
        });

        it("orange-red state should transition to red-green state", function(done) {
            controller.start();
            clock.tick(3000);

            process.nextTick(() => {
                const state = {
                    time: 3,
                    colour: { NS: "Red", EW: "Green" }
                };
                // Account for the initial event that is fired in the constructor
                sinon.assert.callCount(changeEventSpy, 5)
                sinon.assert.calledWith(changeEventSpy.lastCall, state);
                done();
            });
        });
    });
});
