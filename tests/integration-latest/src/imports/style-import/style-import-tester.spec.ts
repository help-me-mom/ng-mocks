import { StyleImportTester } from "./style-import-tester";

describe("StyleImportTester", () => {

    let tester = new StyleImportTester();

    it("should import styles without crashing", () => {

        expect(tester.testRequireCssPackage().indexOf("flexbox")).toBeGreaterThan(0);
    });

    it("should import transformed css modules", () => {

        expect(tester.testRequireTransformedCss().color).toEqual("style-import-tester_color_3Jtsg");
    });
});
