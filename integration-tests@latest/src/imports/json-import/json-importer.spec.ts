import { JsonComponent } from "./component";

describe("JsonComponent", () => {

    let jsonComponent = new JsonComponent();

    it("should require a local json file without crashing the bundler", () => {

        expect(jsonComponent.getLocalJson()).toEqual([1, 2, 3, "a", "b", "c"]);
    });

    it("should require a package.json file from node_modules without crashing the bundler", () => {

        expect(jsonComponent.getPackageJson()).not.toBeUndefined();
    });
});
