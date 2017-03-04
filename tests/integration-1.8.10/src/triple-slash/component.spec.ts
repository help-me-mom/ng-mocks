import { TripleSlashComponent } from "./component";

describe("TripleSlashComponent", () => {

    it("should use triple slash references", () => {

        let tripleSlashComponent = new TripleSlashComponent();

        expect(tripleSlashComponent.run()).toEqual("I used triple slash references!");
    });
});
