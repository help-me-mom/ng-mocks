"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WindowGlobalTester = void 0;
var WindowGlobalTester = /** @class */ (function () {
    function WindowGlobalTester() {
    }
    WindowGlobalTester.prototype.testGlobalWindow = function () {
        return global;
    };
    return WindowGlobalTester;
}());
exports.WindowGlobalTester = WindowGlobalTester;
