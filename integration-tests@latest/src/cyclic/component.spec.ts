import { CyclicReferencesComponent } from "./component";

describe("CyclicReferencesComponent", () => {

    it("should not crash the call stack", () => {

        let cyclicReferencesComponent = new CyclicReferencesComponent();

        expect(cyclicReferencesComponent.run()).toEqual("I didn't crash the call stack :)");
    });
});
