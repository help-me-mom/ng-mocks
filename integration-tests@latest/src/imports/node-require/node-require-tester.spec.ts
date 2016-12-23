import r = require("./requiring");

describe("Requiring", () => {

    it("should be able to require dummy content and real modules", () => {

        let requiring = new r.Requiring();

        expect(requiring.run()).toBeTruthy();
    });
});
