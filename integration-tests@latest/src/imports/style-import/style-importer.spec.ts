import { StyleImporter } from "./style-importer";

describe("StyleImportsComponent", () => {

    it("should import styles without the module loader crashing and burning", () => {

        let styleImporter = new StyleImporter();

        expect(styleImporter.run()).toEqual("I didn't crash and burn!");
    });
});
