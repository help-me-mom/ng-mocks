import { RelativeImportPathComponent } from "./component";

describe("RelativeImportPathComponent", () => {

    it("should be able to import classes using filename extension", () => {

        let relativeImportPathComponent = new RelativeImportPathComponent();

        expect(relativeImportPathComponent.run())
            .toEqual("I imported [object Object], relative to the project!");
    });
});
