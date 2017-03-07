import { ConstantsTester } from "./constants-tester";

describe("ConstantsTester", () => {

    let tester = new ConstantsTester();

    it("should use string constant", () => {
        expect(tester.testString()).toEqual("abc123");
    });

    it("should use non string constant", () => {
        expect(tester.testBoolean()).toBeTruthy();
    });

    it("should use object constant", () => {
        expect(tester.testObject()).toEqual("value");
    });
});
