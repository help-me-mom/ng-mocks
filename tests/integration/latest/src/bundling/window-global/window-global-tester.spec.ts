import { WindowGlobalTester } from "./window-global-tester";

describe("WindowGlobalTester", () => {

    let tester = new WindowGlobalTester();

    it("should use the window object as global", () => {

        expect(tester.testGlobalWindow()).toEqual(window);
    });
});
