import { DefaultExportsTester } from "./default-exports-tester";

describe("DefaultExportsTester", () => {

    let tester = new DefaultExportsTester();

    it("should use default exported module", () => {

        expect(tester.testDefaultExportedModule()).toEqual("2014-04-23");
    });

    it("should extend modules without crashing on non-extensible objects", () => {

        expect(tester.testNonExtensibleObject()).not.toBeUndefined();
    });

    it("should extend modules and make default property non-enumerable", () => {

        expect(tester.testModuleExportsKeys()).toEqual(["DefaultExportsTester"]);
    });

    it("should handle undefined module.exports", () => {

        expect(tester.testUndefinedModuleExports()).toBeUndefined();
    });
});
