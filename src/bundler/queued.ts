import BundleCallback = require("./bundle-callback");
import EmitOutput = require("../compiler/emit-output");
import File = require("../shared/file");
import RequiredModule = require("./required-module");

interface Queued {
    callback: BundleCallback;
    emitOutput: EmitOutput;
    file: File;
    module?: RequiredModule;
}

export = Queued;
