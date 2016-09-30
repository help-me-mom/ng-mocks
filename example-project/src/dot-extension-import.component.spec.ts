import { DotExtensionImportComponent } from "./dot-extension-import.component.ts";

describe("DotExtensionImportComponent", () => {

    it("should be able to import classes using filename extension", () => {

        let dotExtensionImportComponent = new DotExtensionImportComponent();

        expect(dotExtensionImportComponent.run())
            .toEqual("I imported a module relative to the project using the module filename!");
    });
});
