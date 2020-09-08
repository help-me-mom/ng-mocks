"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var window_global_tester_1 = require("./window-global-tester");
describe("WindowGlobalTester", function () {
    var tester = new window_global_tester_1.WindowGlobalTester();
    it("should use the window object as global", function () {
        expect(tester.testGlobalWindow()).toEqual(window);
    });
});
