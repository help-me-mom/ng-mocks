import * as sinon from "sinon";
import { SinonComponent } from "./sinon-component";

describe("SinonComponent", () => {

    it("should be able to spy", () => {

        let calculatorComponent = new SinonComponent();
        let spy = sinon.spy(calculatorComponent, "add");

        let result = calculatorComponent.add(2, 2);

        expect(spy.calledWith(2, 2)).toBeTruthy();
        expect(result).toEqual(4);
    });
});
