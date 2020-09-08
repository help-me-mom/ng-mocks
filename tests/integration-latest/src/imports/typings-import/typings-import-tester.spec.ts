import { TypingsImportTester } from "./typings-import-tester";

describe("TypingsImportTester", () => {

    let tester = new TypingsImportTester();

    it("should import an interface from a typings file", () => {

        expect(tester.value).toBe("Hello!");
    });
});
