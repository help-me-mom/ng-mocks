import * as ts from "typescript";

export interface EmitOutput {
    isDeclarationFile: boolean;
    outputText: string;
    sourceFile: ts.SourceFile;
    sourceMapText: string;
}
