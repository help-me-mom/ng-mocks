import { JsonComponent } from "./component";

describe("JsonComponent", () => {

    it("should require a json file without crashing the bundler", () => {

        let jsonComponent = new JsonComponent();

        expect(jsonComponent.run()).toEqual("I didn't crash the bundler :)");
    });
});
