import { JsImportTester } from "./js-import-tester";

describe("JsImportTester", () => {

    let tester = new JsImportTester();

    it("should import javascript", () => {

        expect(tester.testImportJavascript()).toEqual({
            data: "data",
            headers: {
                authorization: "token secret"
            },
            method: "POST",
            url: "http://example.foo"
        });
    });
});
