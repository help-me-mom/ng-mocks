import * as corejs from "core-js";
import moment from "moment";

export class DefaultExportsTester {

    public testNonExtensibleObject(): MapConstructor {

        return corejs.Map;
    }

    public testDefaultExportedModule(): string {

        return moment(new Date(2014, 3, 23)).format("YYYY-MM-DD");
    }

    public testModuleExportsKeys(): string[] {

        return Object.keys(module.exports);
    }

    public testUndefinedModuleExports(): any {

        return require("./empty-export.js");
    }
}
