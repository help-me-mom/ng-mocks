import { CyclicDependencyTester } from "./cyclic-dependency-tester";

describe("CyclicDependencyTester", () => {

    let tester = new CyclicDependencyTester();

    it("should require cyclic dependency", () => {

        expect(tester.testRequireCyclicDependency()).toBe("[object Object]ba");
    });
});
