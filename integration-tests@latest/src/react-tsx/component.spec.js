"use strict";
var React = require("react");
var TestUtils = require("react-addons-test-utils");
var component_1 = require("./component");
describe("ReactComponent", function () {
    it("should render", function () {
        var renderer = TestUtils.createRenderer();
        renderer.render(React.createElement(component_1.default, {compiler: "Typescript", framework: "React"}));
        expect(renderer.getRenderOutput().props.children).toEqual(["Hello from ", "Typescript", " and ", "React", "!"]);
    });
});
//# sourceMappingURL=component.spec.js.map