import * as os from "os";
import { PostCssTester } from "./postcss-tester";

describe("PostCssTester", () => {

    let tester = new PostCssTester();

    it("should test transforming css with autoprefixer", () => {

        let processed = tester.testTransformCss();
        expect(processed.indexOf("display: -webkit-box;")).toBeGreaterThan(0);
        expect(processed.indexOf("/*# sourceMappingURL=data:application/json;base64")).toBeGreaterThan(0);
    });
});
