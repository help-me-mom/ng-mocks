import { CodemirrorTester } from "./codemirror-tester";

describe("CodemirrorTester", () => {

    let tester = new CodemirrorTester();

    it("should test modeInfo", () => {

        expect(tester.testMetaModeInfo()).not.toBeUndefined();
    });
});
