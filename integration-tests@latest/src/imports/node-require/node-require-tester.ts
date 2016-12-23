export class NodeRequireTester {

    public testRequireLocalClass(): Function {

        let dependency = require("./dependency");
        return new dependency.DependencyComponent();
    }

    public testRequirePackage(): Function {

        return require("util").isArray;
    }

    public testDynamicDependency(): Function {

        // negotiator@0.4.9 uses dynamic require, ie require("./" + k + ".js");
        return require("negotiator");
    }

    public testRequireRelativeTextFile(): string {

        return require("../../../assets/style/require.css").toString();
    }

}
