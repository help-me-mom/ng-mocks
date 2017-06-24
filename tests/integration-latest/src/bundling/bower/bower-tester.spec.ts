import { BowerTester } from "./bower-tester";

describe("AliasTester", () => {

    let tester = new BowerTester();

    it("should resolve bower package", () => {
        expect(tester.testRequireBowerPackage()).toEqual("#00008b");
    });
});
