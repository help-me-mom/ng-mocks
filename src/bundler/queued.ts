import * as ts from "typescript";
import BundleCallback = require("./bundle-callback");
import RequiredModule = require("./required-module");

interface Queued {
    callback: BundleCallback;
    module: RequiredModule;
    moduleFormat: string;
    sourceFile: ts.SourceFile;
}

export = Queued;
