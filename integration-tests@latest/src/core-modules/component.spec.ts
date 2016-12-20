import { CoreModuleComponent } from "./component";

describe("CoreModuleComponent", () => {

    let coreModuleComponent = new CoreModuleComponent();

    it("should core module http", () => {

        expect(coreModuleComponent.testHttp()).not.toBeUndefined();
    });

    it("should core module util", () => {

        expect(coreModuleComponent.testUtil()).toBeTruthy();
    });
});
