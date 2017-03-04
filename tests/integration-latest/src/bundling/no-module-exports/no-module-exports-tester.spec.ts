import { NoModuleExportsTester } from "./no-module-exports-tester";

describe("NoModuleExportsTester", () => {

    let tester = new NoModuleExportsTester();

    it("should import module that requires dependency without module.exports", () => {

        expect(tester.testNoModuleExports()).not.toBeUndefined();
    });
});
