export class LanguageFeaturesTester {

    public testForLoop(): string {

        let result = "";

        for (let item of [1, 2, 3]) {
            result += item;
        }

        return result;
    }
}
