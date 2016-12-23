import { CyclicDependencyTester } from "./cyclic-dependency-tester";

describe("CyclicDependencyTester", () => {

    it("should require cyclic dependency", () => {

        let cyclicDependencyTester = new CyclicDependencyTester();

        expect(cyclicDependencyTester.testRequireCyclicDependency()).not.toBeUndefined();
    });
});
