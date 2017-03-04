import * as acorn from "acorn";
import * as os from "os";

import { Configuration } from "../shared/configuration";

export class Validator {

    constructor(private config: Configuration) {}

    public validate(bundle: string, filename: string) {

        if (this.config.bundlerOptions.validateSyntax) {

            try {
                acorn.parse(bundle);
            }
            catch (error) {

                let possibleFix = "";

                if (error.message.indexOf("'import' and 'export' may only appear at the top level") !== -1) {
                    possibleFix = "Possible fix: configure karma-typescript to compile " +
                                    "es6 modules with karma-typescript-es6-transform";
                }

                throw new Error("Invalid syntax in bundle: " + error.message + os.EOL +
                    "in " + filename + os.EOL +
                    "at line " + error.loc.line + ", column " + error.loc.column + ":" + os.EOL + os.EOL +
                    "... " + bundle.slice(error.pos, error.pos + 50) + " ..." + os.EOL + os.EOL +
                    possibleFix + (possibleFix ? os.EOL : ""));
            }
        }
    }
}
