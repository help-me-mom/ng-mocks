import { FormattingTester } from "./formatting-tester";

describe("FormattingTester", () => {

    let tester = new FormattingTester();

    it("should keep formatting when bundled", () => {

        expect(tester.testOneliner()).toEqual("This one line function kept it's formatting!");
    });
});
