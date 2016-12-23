import { JsonImportTester } from "./json-import-tester";

describe("JsonImporter", () => {

    let tester = new JsonImportTester();

    it("should require a local json file", () => {

        expect(tester.testLocalJSON()).toEqual([1, 2, 3, "a", "b", "c"]);
    });

    it("should require a package.json file from a node_modules package", () => {

        expect(tester.testPackageJSON()).not.toBeUndefined();
    });
});
