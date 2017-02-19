import * as ts from "typescript";

export interface EmitOutput {
    isDeclarationFile: string;
    outputText: string;
    sourceFile: ts.SourceFile;
    sourceMapText: string;
}
