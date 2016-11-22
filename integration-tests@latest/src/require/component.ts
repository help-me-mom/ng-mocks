require("../../assets/style/require.css");

export class RequireComponent {

    public run(): boolean {

        let util = require("util");

        return util !== undefined;
    }
}
