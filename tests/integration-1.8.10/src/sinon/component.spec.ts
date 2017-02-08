import * as sinon from "sinon";
import { CalculatorComponent } from "./component";

describe("CalculatorComponent", () => {

    it("should add numbers", () => {

        let calculatorComponent = new CalculatorComponent();
        let spy = sinon.spy(calculatorComponent, "add");

        let result = calculatorComponent.add(2, 2);

        expect(spy.calledWith(2, 2)).toBeTruthy();
        expect(result).toEqual(4);
    });
});
