import A from "./commonjs-a"
import A2 from "karma-typescript-test-module-commonjs-a";

describe("CommonJS", () => {

    it("should extend class B, Typescript", () => {

        const a = new A();
        expect(A.name).toEqual("A");
        expect(a.hello()).toEqual("Hello from A! Hello from B!");
    });

    it("should extend class B, commonjs", () => {

        expect(A2.name).toEqual("A");
        expect(new (A2 as any)().hello()).toEqual("Hello from A! Hello from B!");
    });
});
