import * as os from "os";
import { PostCssTester } from "./postcss-tester";

describe("PostCssTester", () => {

    let tester = new PostCssTester();

    it("should test transforming css with autoprefixer", () => {

        expect(tester.testTransformCss()).toEqual(".box {" + os.EOL +
"    display: -webkit-box;" + os.EOL +
"    display: -ms-flexbox;" + os.EOL +
"    display: flex;" + os.EOL +
"}" + os.EOL + os.EOL +

"/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInN0eWxlLmNzcyJd" +
"LCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtJQUNJLHFCQUFjO0lBQWQscUJBQWM7SUFBZCxjQUFjO0NBQ2pCIiwiZmlsZS" +
"I6InN0eWxlLmNzcyIsInNvdXJjZXNDb250ZW50IjpbIi5ib3gge1xuICAgIGRpc3BsYXk6IGZsZXg7XG59XG4iXX0= */");
    });
});
