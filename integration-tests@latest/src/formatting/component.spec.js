"use strict";
var component_1 = require("./component");
describe("FormattingComponent", function () {
    it("should keep formatting when run through the ast parser", function () {
        var formattingComponent = new component_1.FormattingComponent();
        expect(formattingComponent.oneliner()).toEqual("This one line function kept it's formatting!");
    });
});
//# sourceMappingURL=component.spec.js.map