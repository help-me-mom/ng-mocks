import { AmbientModuleTester } from "./ambient-module-tester";

describe("AmbientModuleTester", () => {

    let tester = new AmbientModuleTester();

    it("should resolve ambient module", () => {
        expect(tester.testAmbientModule()).toEqual("ambient");
    });
});
