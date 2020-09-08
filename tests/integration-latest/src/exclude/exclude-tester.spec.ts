import { ExcludeTester } from "./exclude-tester";

describe("ExcludeTester", () => {

    let tester = new ExcludeTester();

    it("should require excluded dependency", () => {

        expect(tester.testRequire()).toBe(true);
    });
});
