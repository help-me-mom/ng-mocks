import { LanguageFeaturesTester } from "../../typescript/language-features/language-features-tester";
import { RelativePathImportTester } from "./relative-path-import-tester";

describe("RelativePathImportTester", () => {

    let tester = new RelativePathImportTester();

    it("should import a class from a relative path", () => {

        expect(tester.testImportClassFromRelativePath()).toEqual(new LanguageFeaturesTester());
    });
});
