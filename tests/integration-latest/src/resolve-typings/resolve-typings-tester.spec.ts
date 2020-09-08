import { ResolveTypingsTester } from "./resolve-typings-tester";

describe("ResolveTypingsTester", () => {

    let tester = new ResolveTypingsTester();

    it("should resolve javascript from typing", () => {

        expect(tester.testJavascriptImportedWithTyping()).toEqual("Hello!");
    });
});
