import { RelativePathImporter } from "./relative-path-importer";

describe("RelativePathImporter", () => {

    it("should be able to import classes using filename extension", () => {

        let relativePathImporter = new RelativePathImporter();

        expect(relativePathImporter.run())
            .toEqual("I imported [object Object], relative to the project!");
    });
});
