"use strict";
var component_1 = require("./component");
describe("StyleImportsComponent", function () {
    it("should import styles without the module loader crashing and burning", function () {
        var styleImportsComponent = new component_1.StyleImportsComponent();
        expect(styleImportsComponent.doSomething()).toEqual("I didn't crash and burn!");
    });
});
//# sourceMappingURL=component.spec.js.map