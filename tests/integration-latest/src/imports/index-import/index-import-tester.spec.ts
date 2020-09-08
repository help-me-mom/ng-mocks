import { IndexComponent } from "./dependency/index";
import { IndexComponentWithSlash } from "./dependency/index";
import { IndexImportTester } from "./index-import-tester";

describe("IndexImporter", () => {

    let tester = new IndexImportTester();

    it("should import using index.ts", () => {

        expect(tester.testImportIndex()).toEqual(new IndexComponent());
    });

    it("should import using index.ts with a trailing slash", () => {

        expect(tester.testImportIndexWithSlash()).toEqual(new IndexComponentWithSlash());
    });
});
