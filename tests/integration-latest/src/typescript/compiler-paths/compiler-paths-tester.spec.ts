import "compilerpaths-js/api/index";
import { CompilerPathsTester } from "compilerpaths/compiler-paths-tester";

describe("CompilerPathsTester", () => {

    let tester = new CompilerPathsTester();

    it("should use paths option in tsconfig", () => {

        expect(tester.test()).toEqual("function");
    });
});
