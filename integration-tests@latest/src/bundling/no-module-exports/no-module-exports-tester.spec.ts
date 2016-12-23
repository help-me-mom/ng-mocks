import { NoModuleExportsTester } from "./no-module-exports-tester";

describe("NoModuleExportsTester", () => {

    it("should import module that requires dependency without module.exports", () => {

        let noModuleExportsTester = new NoModuleExportsTester();

        expect(noModuleExportsTester.testNoModuleExports()).not.toBeUndefined();
    });
});
