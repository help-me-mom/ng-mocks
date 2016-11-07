import { LanguageFeaturesComponent } from "../typescript-language-features/component";

export class RelativeImportPathComponent {

    public run(): string {

        let languageFeaturesComponent = new LanguageFeaturesComponent();

        return `I imported ${languageFeaturesComponent}, relative to the project!`;
    }
}
