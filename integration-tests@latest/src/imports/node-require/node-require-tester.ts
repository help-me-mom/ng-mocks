require("../../../assets/style/require.css");

export class Requiring {

    public run(): boolean {

        let util = require("util");
        let req = require("./dependency");
        let dep = new req.DependencyComponent();

        return util !== undefined && dep.dependOnMe() === "I was required!";
    }
}
