import { BrowserFieldTester } from "./browser-field-tester";

describe("BrowserFieldTester", () => {

    let tester = new BrowserFieldTester();

    it("should resolve package with dependencies listed in package.json browser field", () => {
        expect(tester.testRequirePackageWithBrowserField()).not.toBeUndefined();
    });
});
