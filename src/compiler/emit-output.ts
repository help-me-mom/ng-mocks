import * as ts from "typescript";

export interface EmitOutput {
    ambientModuleNames: string[];
    isAmbientModule: boolean;
    isDeclarationFile: boolean;
    outputText: string;
    sourceFile: ts.SourceFile;
    sourceMapText: string;
}
