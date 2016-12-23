import { RelativePathImportTester } from "./relative-path-import-tester";
import { LanguageFeaturesComponent } from "../../typescript-language-features/component";

describe("RelativePathImportTester", () => {

    let tester = new RelativePathImportTester();

    it("should import a class from a relative path", () => {

        expect(tester.testImportClassFromRelativePath()).toEqual(new LanguageFeaturesComponent());
    });
});
