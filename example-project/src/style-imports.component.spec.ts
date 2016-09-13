import { StyleImportsComponent } from "./style-imports.component";

describe("StyleImportsComponent", () => {

    it("should import styles without the module loader crashing and burning", () => {

        let styleImportsComponent = new StyleImportsComponent();

        expect(styleImportsComponent.doSomething()).toEqual("I didn't crash and burn!");
    });
});
