import { NodeModulesImportComponent } from "./node-modules-import.component";

describe("NodeModulesImportComponent", () => {

    it("should be able to import modules from node_modules", () => {

        let dotExtensionImportComponent = new NodeModulesImportComponent();

        expect(dotExtensionImportComponent.sayHello()).toEqual("I imported a module from node_modules!");
    });
});
