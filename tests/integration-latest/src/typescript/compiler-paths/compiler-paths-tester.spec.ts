import "compilerpaths-js/api/index";
// @ts-ignore
import { CompilerPathsTester } from "compilerpaths/compiler-paths-tester";

describe("CompilerPathsTester", () => {

    const tester = new CompilerPathsTester();

    it("should use paths option in tsconfig", () => {

        expect(tester.testNodeModules()).toEqual("function");
    });

    // TODO: does ths also cover #175, https://github.com/MasterCassim/karma-typescript-175?
    it("should use paths option in tsconfig, path outside the project", () => {

        expect(tester.testOutsideProject()).toEqual("object");
    });
});
