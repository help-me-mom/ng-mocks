import { WindowGlobalTester } from "./window-global-tester";

describe("WindowGlobalTester", () => {

    it("should use the window object as global", () => {

        let windowGlobalTester = new WindowGlobalTester();

        expect(windowGlobalTester.testGlobalWindow()).toEqual(window);
    });
});
