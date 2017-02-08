import { ExportedClass } from "./exports-tester";

describe("ExportedClass", () => {

    it("should export class", () => {

        let exportedClass = new ExportedClass();

        expect(exportedClass.hello()).toEqual("Hello from an exported class!");
    });
});
