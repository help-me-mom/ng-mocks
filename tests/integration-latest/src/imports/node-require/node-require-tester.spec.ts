import req = require("./node-require-tester");

describe("NodeRequireTester", () => {

    let tester = new req.NodeRequireTester();

    it("should require a local class", () => {

        let dependency = require("./dependency");

        expect(tester.testRequireLocalClass()).toEqual(new dependency.DependencyComponent());
    });

    it("should require a package from node_modules with dynamically required dependencies", () => {

        expect(tester.testDynamicDependency()).toEqual("Hello!");
    });

    it("should require a text file on a relative path", () => {

        expect(tester.testRequireRelativeTextFile().indexOf("margin: 0;")).toBeGreaterThan(0);
    });
});
