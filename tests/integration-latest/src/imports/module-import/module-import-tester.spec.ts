import { ModuleImportTester } from "./module-import-tester";

describe("ModuleImportTester", () => {

    const tester = new ModuleImportTester();

    it("should import default module", () => {

        expect(tester.testImportDefaultModule()).toEqual(3);
    });

    it("should import module", () => {

        expect(tester.testImportModule()).toEqual(3);
    });

    it("should extend modules without crashing on non-extensible objects", () => {

        const nonExtensibleObject = tester.testNonExtensibleObject();
        expect(nonExtensibleObject).toEqual({ a: 'b' });
        expect(Object.isExtensible(nonExtensibleObject)).toBe(false);
    });

    it("should extend modules and make default property non-enumerable", () => {

        expect(tester.testModuleExportsKeys()).toEqual(["ModuleImportTester"]);
    });

    it("should handle undefined module.exports", () => {

        expect(tester.testUndefinedModuleExports()).toBeUndefined();
    });
});
