"use strict";
var component_1 = require("./component");
var MockComponentService = (function () {
    function MockComponentService() {
    }
    MockComponentService.prototype.sayHello = function () {
        return "Hello world!";
    };
    return MockComponentService;
}());
describe("Component", function () {
    it("should say 'Hello world!'", function () {
        var mockComponentService = new MockComponentService();
        var component = new component_1.Component(mockComponentService);
        expect(component.sayHello()).toEqual("Hello world!");
    });
});
//# sourceMappingURL=component.spec.js.map