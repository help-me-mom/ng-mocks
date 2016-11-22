import { IndexRequireComponent } from "./component";

describe("IndexRequireComponent", () => {

    it("should import using index.ts", () => {

        let indexRequireComponent = new IndexRequireComponent();

        expect(indexRequireComponent.getMessageFromDependency()).toEqual("I'm in a file named index.ts");
    });

    it("should import using index.ts with a trailing slash", () => {

        let indexRequireComponent = new IndexRequireComponent();

        expect(indexRequireComponent.getMessageFromDependencyWithSlash()).toEqual("I was required using a trailing slash");
    });
});
