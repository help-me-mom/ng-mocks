import zip = require("./component");

describe("ZipCodeValidator", () => {

    it("should be able to require, nodejs style", () => {

        let validator = new zip();

        expect(validator.isAcceptable("12345")).toBeTruthy();
    });
});
