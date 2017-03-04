import { NoParseTester } from "./no-parse-tester";

describe("NoParseTester", () => {

    let tester = new NoParseTester();

    it("should require library that shouldn't be parsed", () => {

        expect(tester.testRequire()).not.toBeUndefined();
    });
});
