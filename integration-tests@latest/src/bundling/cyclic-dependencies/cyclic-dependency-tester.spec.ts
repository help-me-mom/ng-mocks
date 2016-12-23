import { CyclicDependency } from "./cyclic-dependency";

describe("CyclicDependency", () => {

    it("should not crash the call stack", () => {

        let cyclicDependency = new CyclicDependency();

        expect(cyclicDependency.run()).toEqual("I didn't crash the call stack :)");
    });
});
