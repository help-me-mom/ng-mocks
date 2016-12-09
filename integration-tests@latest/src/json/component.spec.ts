import { JsonComponent } from "./component";

describe("JsonComponent", () => {

    it("should require a json file without crashing the bundler", () => {

        let jsonComponent = new JsonComponent();

        expect(jsonComponent.run()).toEqual([1, 2, 3, "a", "b", "c"]);
    });
});
