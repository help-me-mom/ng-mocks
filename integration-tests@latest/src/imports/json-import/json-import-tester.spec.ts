import { JsonImporter } from "./json-importer";

describe("JsonImporter", () => {

    let jsonImporter = new JsonImporter();

    it("should require a local json file without crashing the bundler", () => {

        expect(jsonImporter.getLocalJson()).toEqual([1, 2, 3, "a", "b", "c"]);
    });

    it("should require a package.json file from node_modules without crashing the bundler", () => {

        expect(jsonImporter.getPackageJson()).not.toBeUndefined();
    });
});
