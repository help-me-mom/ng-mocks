import * as sinon from "sinon";
import { SinonTester } from "./sinon-tester";

describe("SinonTester", () => {

    let tester = new SinonTester();

    it("should be able to spy", () => {

        let spy = sinon.spy(tester, "add");
        let result = tester.add(2, 2);

        expect(spy.calledWith(2, 2)).toBeTruthy();
        expect(result).toEqual(4);
    });
});
