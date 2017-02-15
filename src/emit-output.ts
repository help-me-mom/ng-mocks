import RequiredModule = require("./required-module");

interface EmitOutput {
    isDeclarationFile: string;
    outputText: string;
    requiredModules: RequiredModule[];
    sourceMapText: string;
}

export = EmitOutput;
