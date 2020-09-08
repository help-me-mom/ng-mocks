import { Es6TransformTester } from "./es6-transform-tester";

describe("Es6TransformTester", () => {

    let tester = new Es6TransformTester();

    it("should import @ngrx/effects", () => {
        expect(tester.testEs6Transform()).toBe(3);
    });
});
