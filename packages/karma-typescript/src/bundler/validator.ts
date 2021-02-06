import * as acorn from "acorn";
import { Logger } from "log4js";
import * as os from "os";

import { Configuration } from "../shared/configuration";

export class Validator {

    constructor(private config: Configuration, private log: Logger) {}

    public validate(bundle: string, filename: string) : void {

        if (this.config.bundlerOptions.validateSyntax) {

            try {
                acorn.parse(bundle, {
                    // defaults to TS "latest" version
                    ecmaVersion: "latest"
                });
            }
            catch (error) {

                let possibleFix = "";

                if (error.message.indexOf("'import' and 'export' may only appear at the top level") !== -1) {
                    possibleFix = "Possible fix: configure karma-typescript to compile " +
                                    "es6 modules with karma-typescript-es6-transform";
                }

                const errorMessage = "Invalid syntax in bundle: " + error.message + os.EOL +
                    "in " + filename + os.EOL +
                    "at line " + error.loc.line + ", column " + error.loc.column + ":" + os.EOL + os.EOL +
                    "... " + bundle.slice(error.pos, error.pos + 50) + " ..." + os.EOL + os.EOL +
                    possibleFix + (possibleFix ? os.EOL : "");

                this.log.error(errorMessage);

                throw new Error(errorMessage);
            }
        }
    }
}
