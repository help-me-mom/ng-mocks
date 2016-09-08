import { LanguageFeaturesComponent } from "./language-features.component";

describe("LanguageFeaturesComponent", () => {

    it("should use Typescript features without the compiler crashing and burning", () => {

        let languageFeaturesComponent = new LanguageFeaturesComponent();

        expect(languageFeaturesComponent.trySomeLanguageFeatures()).toEqual("I'm alive!");
    });
});
