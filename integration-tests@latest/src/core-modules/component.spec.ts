import { CoreModuleComponent } from "./component";

describe("CoreModuleComponent", () => {

    it("should import builtin node modules without the bundler crashing and burning", () => {

        let coreModuleComponent = new CoreModuleComponent();

        expect(coreModuleComponent.isNumber(42)).toBeTruthy();
    });
});
