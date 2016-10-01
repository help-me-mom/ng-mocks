import { Angular2Component } from "./component";

describe("Angular2Component", () => {

    it("should import angular from node_modules", () => {

        let dotExtensionImportComponent = new Angular2Component();

        expect(dotExtensionImportComponent.sayHello()).toEqual("I imported a module from node_modules!");
    });
});
