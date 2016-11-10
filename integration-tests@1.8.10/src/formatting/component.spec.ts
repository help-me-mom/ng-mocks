import { FormattingComponent } from "./component";

describe("FormattingComponent", () => {

    it("should keep formatting when run through the ast parser", () => {

        let formattingComponent = new FormattingComponent();

        expect(formattingComponent.oneliner()).toEqual("This one line function kept it's formatting!");
    });
});
