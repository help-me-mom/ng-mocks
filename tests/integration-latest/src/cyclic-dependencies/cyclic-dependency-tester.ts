const cyclic = require("karma-typescript-test-module/cyclic-dependency");

export class CyclicDependencyTester {

    public testRequireCyclicDependency(): any {

        return cyclic();
    }
}
