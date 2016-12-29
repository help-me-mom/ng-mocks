import { jQueryTester } from "./jquery-tester";

describe("jQueryTester", () => {

    let tester = new jQueryTester();

    it("should test require", () => {

        expect(tester.testRequire()).not.toBeUndefined();
    });
});
