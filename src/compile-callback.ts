import EmitOutput = require("./emit-output");

interface CompileCallback {
    (emitOutput: EmitOutput): void;
}

export = CompileCallback;
