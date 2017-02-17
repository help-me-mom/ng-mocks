import * as ts from "typescript";

interface EmitOutput {
    isDeclarationFile: string;
    outputText: string;
    sourceFile: ts.SourceFile;
    sourceMapText: string;
}

export = EmitOutput;
