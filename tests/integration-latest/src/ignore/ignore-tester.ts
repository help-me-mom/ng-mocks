import ignorer from "karma-typescript-test-module/ignorer";

export class IgnoreTester {

    public testRequireIgnorer(): string {

        return ignorer();
    }

    public testRequireIgnored(): any {

        return require("karma-typescript-test-module/ignored");
    }
}
