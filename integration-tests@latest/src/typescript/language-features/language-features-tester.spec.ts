import { LanguageFeaturesTester } from "./language-features-tester";

describe("LanguageFeaturesTester", () => {

    let tester = new LanguageFeaturesTester();

    it("should use Typescript features", () => {

        expect(tester.testForLoop()).toEqual("123");
    });
});
