import { AliasTester } from "./alias-tester";

describe("AliasTester", () => {

    let tester = new AliasTester();

    it("should resolve aliased module", () => {
        expect(tester.testAlias()).not.toBeUndefined();
    });
});
