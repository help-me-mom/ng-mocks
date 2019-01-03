import { JsonImportTester } from "./json-import-tester";

describe("JsonImporter", () => {

    let tester = new JsonImportTester();

    it("should require a local json file", () => {

        expect(tester.testLocalJSON()).toEqual([1, 2, 3, "a", "b", "c"]);
    });

    it("should require a package.json file from a node_modules module", () => {

        expect(tester.testPackageJSON()).not.toBeUndefined();
    });

    it("should require a node_modules module that requires JSON", () => {

        expect(tester.testRequireModuleRequiringJSON()).not.toBeUndefined();
    });

    it("should support TS import of a json file", () => {
        const { local, pkg } = tester.testTSImportJSON();
        expect(local).toEqual([1, 2, 3, "a", "b", "c"]);
        expect(pkg).not.toBeUndefined();
    });
});
