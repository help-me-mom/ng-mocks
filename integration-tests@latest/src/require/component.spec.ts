import r = require("./component");

describe("RequireComponent", () => {

    it("should be able to require dummy content and real modules", () => {

        let requireComponent = new r.RequireComponent();

        expect(requireComponent.run()).toBeTruthy();
    });
});
