"use strict";
var component_1 = require("./component");
describe("PerformanceComponent", function () {
    it("should run", function () {
        var performanceComponent = new component_1.PerformanceComponent();
        expect(performanceComponent.run()).toEqual("I imported a node_modules module!");
    });
});
//# sourceMappingURL=component.spec.js.map