function Compiler(logger) {

    var log = logger.create("compiler.karma-typescript"),
        tsc = require("typescript");

    var tsIgnoredErrors = [
        2304, // Cannot find name (missing typing)
        2307, // Cannot find module
        2339, // Property does not exist on type (missing typing)
        6053  // File not found
    ];

    function transpileModule(input, transpileOptions) {

        var diagnostics = [];
        var options = transpileOptions.compilerOptions || tsc.getDefaultCompilerOptions();

        var sourceFile = tsc.createSourceFile(transpileOptions.fileName, input, options.target);

        var newLine = tsc.getNewLineCharacter(options),
            outputText,
            sourceMapText,
            compilerHost = {

                getSourceFile: function (fileName) {
                    return fileName === tsc.normalizePath(transpileOptions.fileName) ? sourceFile : undefined;
                },
                writeFile: function (name, text) {

                    if (tsc.fileExtensionIs(name, ".map")) {
                        tsc.Debug.assert(sourceMapText === undefined, "Unexpected multiple source map outputs for the file '" + name + "'");
                        sourceMapText = text;
                    }
                    else {
                        tsc.Debug.assert(outputText === undefined, "Unexpected multiple outputs for the file: '" + name + "'");
                        outputText = text;
                    }
                },
                getDefaultLibFileName: function () {
                    return "lib.d.ts";
                },
                useCaseSensitiveFileNames: function () {
                    return false;
                },
                getCanonicalFileName: function (fileName) {
                    return fileName;
                },
                getCurrentDirectory: function () {
                    return "";
                },
                getNewLine: function () {
                    return newLine;
                },
                fileExists: function (fileName) {
                    return fileName === transpileOptions.fileName;
                },
                readFile: function () {
                    return "";
                },
                directoryExists: function () {
                    return true;
                },
                getDirectories: function () {
                    return [];
                }
            },
            program = tsc.createProgram([transpileOptions.fileName], options, compilerHost),
            diagnosticErrors = [];

        tsc.addRange(diagnostics, program.getSemanticDiagnostics(sourceFile));
        tsc.addRange(diagnostics, program.getSyntacticDiagnostics(sourceFile));
        tsc.addRange(diagnostics, program.getOptionsDiagnostics());

        diagnostics.forEach(function(item){

            if(tsIgnoredErrors.indexOf(item.code) === -1) {

                diagnosticErrors.push(item);
            }
        });

        diagnosticErrors.forEach(function(error){
            log.error("TS%s: %s", error.code, error.messageText);
        });

        if(diagnosticErrors.length > 0) {
            throw new Error("Typescript compilation error");
        }

        program.emit();

        return {
            outputText: outputText,
            diagnostics: diagnostics,
            sourceMapText: sourceMapText
        };
    }

    this.transpileModule = transpileModule;
}

module.exports = Compiler;
