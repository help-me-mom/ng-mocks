import { TypingsImporter } from "./typings-importer";

describe("TypingsImporter", () => {

    it("should be able to import an interface from a typings file", () => {

        let typingsImporter = new TypingsImporter();

        expect(typingsImporter.value).not.toBeUndefined();
    });
});
