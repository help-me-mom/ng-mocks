export class NodeRequireTester {

    public testRequireLocalClass(): Function {

        let dependency = require("./dependency");
        return new dependency.DependencyComponent();
    }

    public testDynamicDependency(): string {

        const dynamicRequire = require("karma-typescript-test-module/dynamic-require");
        return dynamicRequire();
    }

    public testRequireRelativeTextFile(): string {

        return require("../../../assets/style/require.css").toString();
    }

}
