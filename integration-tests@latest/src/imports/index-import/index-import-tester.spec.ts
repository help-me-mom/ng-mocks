import { IndexImportTester } from "./index-import-tester";
import { IndexComponent } from "./dependency/index";
import { IndexComponentWithSlash } from "./dependency/index";

describe("IndexImporter", () => {

    let indexImportTester = new IndexImportTester();

    it("should import using index.ts", () => {

        expect(indexImportTester.testImportIndex()).toEqual("IndexComponent");
    });

    it("should import using index.ts with a trailing slash", () => {

        expect(indexImportTester.testImportIndexWithSlash()).toEqual("IndexComponentWithSlash");
    });
});
