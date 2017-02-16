import * as ts from "typescript";

interface EmitOutput {
    isDeclarationFile: string;
    moduleFormat: string;
    outputText: string;
    sourceFile: ts.SourceFile;
    sourceMapText: string;
}

export = EmitOutput;
