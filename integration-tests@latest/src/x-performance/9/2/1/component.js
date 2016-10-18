"use strict";
var core_1 = require("@angular/core");
var PerformanceComponent = (function () {
    function PerformanceComponent() {
    }
    PerformanceComponent.prototype.run = function () {
        core_1.Component.toString();
        return "I imported a node_modules module!";
    };
    return PerformanceComponent;
}());
exports.PerformanceComponent = PerformanceComponent;
//# sourceMappingURL=component.js.map