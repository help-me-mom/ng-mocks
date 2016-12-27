import { CodemirrorComponent } from "./codemirror-component";

describe("CodemirrorComponent", () => {

    it("should return modeInfo", () => {

        let codemirrorComponent = new CodemirrorComponent();

        expect(codemirrorComponent.useMetaModeInfo()).not.toBeUndefined();
    });
});
