import A from "./commonjs-a"

describe("CommonJS", () => {

    it("should extend class", () => {

        const a = new A();
        expect(a.hello()).toEqual("Hello from A! Hello from B!");
    });
});
