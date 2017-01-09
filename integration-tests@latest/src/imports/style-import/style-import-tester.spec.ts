import { StyleImportTester } from "./style-import-tester";

describe("StyleImportTester", () => {

    let tester = new StyleImportTester();

    it("should import styles without", () => {

        expect(tester.testRequireCssPackage().indexOf("flexbox")).toBeGreaterThan(0);
    });
});
