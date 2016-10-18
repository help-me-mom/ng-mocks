"use strict";
var component_1 = require("./component");
describe("LanguageFeaturesComponent", function () {
    it("should use Typescript features without the compiler crashing and burning", function () {
        var languageFeaturesComponent = new component_1.LanguageFeaturesComponent();
        expect(languageFeaturesComponent.trySomeLanguageFeatures()).toEqual("I'm alive!");
    });
});
//# sourceMappingURL=component.spec.js.map