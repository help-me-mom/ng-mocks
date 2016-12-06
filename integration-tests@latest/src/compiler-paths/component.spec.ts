import { CompilerPathComponent } from "compilerpaths/component";

describe("CompilerPathComponent", () => {

    it("should use paths option in tsconfig without crashing the bundler", () => {

        let compilerPathComponent = new CompilerPathComponent();

        expect(compilerPathComponent.run()).toEqual("I didn't break the bundler :)");
    });
});
