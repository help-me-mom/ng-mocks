import { DynamicRequire } from "./dynamic-require";

describe("DynamicRequire", () => {

    it("should be able to require dynamically", () => {

        let dynamicRequire = new DynamicRequire();

        expect(dynamicRequire.run()).toBeTruthy();
    });
});
