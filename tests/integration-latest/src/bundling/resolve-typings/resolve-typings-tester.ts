import { jsLib } from "./js-lib";

export class ResolveTypingsTester {

    public testJavascriptImportedWithTyping(): string {
        return new jsLib.SomeClass().sayHello();
    }
}
