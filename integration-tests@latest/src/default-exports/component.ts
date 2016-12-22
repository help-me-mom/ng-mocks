import * as corejs from "core-js";
import moment from "moment";
require("./empty-export.js"); // bundler shouldn't choke on undefined module.exports

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
}
