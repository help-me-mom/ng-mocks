import { IgnoreTester } from "./ignore-tester";

describe("IgnoreTester", () => {

    let tester = new IgnoreTester();

    it("should be required without ignored dependencies", () => {

        expect(tester.testRequire()).toBeTruthy();
    });
});
