import { Es6TransformTester } from "./es6-transform-tester";

describe("Es6TransformTester", () => {

    let tester = new Es6TransformTester();

    it("should import @ngrx/effects", () => {
        expect(tester.testNgrxEffects()).toEqual("object");
    });

    it("should import d3-ng2-service", () => {
        expect(tester.testD3Ng2Service()).toEqual("function");
    });

    it("should import lodash-es", () => {
        expect(tester.testLodashEs()).toEqual(3);
    });
});
