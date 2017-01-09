import { RelativePathImportTester } from "./relative-path-import-tester";
import { LanguageFeaturesTester } from "../../typescript/language-features/language-features-tester";

describe("RelativePathImportTester", () => {

    let tester = new RelativePathImportTester();

    it("should import a class from a relative path", () => {

        expect(tester.testImportClassFromRelativePath()).toEqual(new LanguageFeaturesTester());
    });
});
