import { DynamicRequireComponent } from "./component";

describe("DynamicRequireComponent", () => {

    it("should be able to require dynamically", () => {

        let dynamicRequireComponent = new DynamicRequireComponent();

        expect(dynamicRequireComponent.run()).toBeTruthy();
    });
});
