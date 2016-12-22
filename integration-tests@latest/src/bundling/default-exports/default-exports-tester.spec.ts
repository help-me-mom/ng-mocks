import { DefaultExportsTester } from "./default-exports-tester";

describe("DefaultExportsTester", () => {

    let defaultExportsTester = new DefaultExportsTester();

    it("should use default exported module", () => {

        expect(defaultExportsTester.testDefaultExportedModule()).toEqual("2014-04-23");
    });

    it("should extend modules without crashing on non-extensible objects", () => {

        expect(defaultExportsTester.testNonExtensibleObject()).not.toBeUndefined();
    });

    it("should extend modules and make default property non-enumerable", () => {

        expect(defaultExportsTester.testModuleExportsKeys()).toEqual(["DefaultExportsTester"]);
    });
});
