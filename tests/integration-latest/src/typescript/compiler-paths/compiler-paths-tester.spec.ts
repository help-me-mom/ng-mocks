import { CompilerPathsTester } from "compilerpaths/compiler-paths-tester";

describe("CompilerPathsTester", () => {

    const tester = new CompilerPathsTester();

    it("should use paths option in tsconfig #1", () => {

        expect(tester.testNodeModules1()).toEqual(3);
    });

    it("should use paths option in tsconfig #2", () => {

        expect(tester.testNodeModules2()).toEqual(3);
    });
});
