import { IgnoreTester } from "./ignore-tester";

describe("IgnoreTester", () => {

    let tester = new IgnoreTester();

    it("should import without ignored dependencies", () => {

        expect(tester.testRequireIo()).toBeTruthy();
    });

    it("should require ignored module", () => {

        expect(tester.testRequireWs()).toEqual({});
    });
});
