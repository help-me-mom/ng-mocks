export class NoParseTester {

    public testRequire(): any {

        return require("clear"); // clear@0.0.1 makesacorn barf
    }
}
