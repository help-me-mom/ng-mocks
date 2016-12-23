import { CyclicDependencyTester } from "./cyclic-dependency-tester";

describe("CyclicDependencyTester", () => {

    it("should not crash the call stack", () => {

        let cyclicDependencyTester = new CyclicDependencyTester();

        expect(cyclicDependencyTester.run()).toEqual("I didn't crash the call stack :)");
    });
});
