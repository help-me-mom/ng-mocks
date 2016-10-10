function Compiler() {

    var ts = require("typescript"),

        context,
        log,
        program,
        compiledFiles = {};
        //servicesHost,
        //services;

    function compileProject(_context_, _log_) {

        context = _context_;
        log = _log_;

        log.info("compiling project");

        initializeProgram();
        //initializeService();
        //runDiagnostics();

        program.emit();

        log.info("done compiling project");
    }

    /*
    function runDiagnostics() {

        var diagnostics = services.getCompilerOptionsDiagnostics();

        Object.keys(context.files).forEach(function(filename){

            ts.addRange(diagnostics, services.getSemanticDiagnostics(filename));
            ts.addRange(diagnostics, services.getSyntacticDiagnostics(filename));
        });

        diagnostics.forEach(function(item){
            log.error("TS%s: %s %s", item.code, item.messageText, item.file.path);
        });
    }*/

    function compileFile(filename, compiledFilename) {

        log.info("compile file");
        //context.files[filename].text = text;
        //context.files[filename].version++;

        initializeProgram();

        return get(filename, compiledFilename);
    }

    function get(filename, compiledFilename) {

        return {
            outputText: compiledFiles[compiledFilename],
            sourceMapText: compiledFiles[compiledFilename + ".map"]
        };

        //console.log(compiledFiles[compiledFilename + ".map"]);

        //ts.fileExtensionIs(name, ".map")

        /*
        var result = {},
            emitOutput = services.getEmitOutput(filename);

        emitOutput.outputFiles.forEach(function(file){

            if(file.name === compiledFilename){
                result.outputText = file.text;
            }

            if(file.name === compiledFilename + ".map") {
                result.sourceMapText = file.text;
            }
        });

        return result;
        */
    }

    /*
    function initializeService() {

        servicesHost = {
            getScriptFileNames: function() {
                return Object.keys(context.files);
            },
            getScriptVersion: function(filename) {
                return (context.files[filename] && context.files[filename].version.toString()) || 0;
            },
            getScriptSnapshot: function(filename) {

                var file = context.files[filename];

                return ts.ScriptSnapshot.fromString(file ? file.text : ts.sys.readFile(filename));
            },
            getCurrentDirectory: function() {
                return context.basePath;
            },
            getCompilationSettings: function() {
                return context.options;
            },
            getDefaultLibFileName: function() {
                return context.defaultLibFilename;
            },
            resolveModuleNames: function(moduleNames, containingFile) {

                return moduleNames.map(function(moduleName){

                    var result = ts.resolveModuleName(moduleName, containingFile, context.options, {
                        fileExists: function(filename) {
                            return ts.sys.fileExists(filename);
                        },
                        readFile: function(filename) {
                            return ts.sys.readFile(filename);
                        }
                    });

                    return result.resolvedModule;
                });
            }
        };

        services = ts.createLanguageService(servicesHost, ts.createDocumentRegistry());
    }*/

    this.compileProject = compileProject;
    this.compileFile = compileFile;
    this.get = get;

    function initializeProgram() {

        var newLine = ts.getNewLineCharacter(context.options),
            compilerHost = {

                getSourceFile: function (filename, languageVersion) {
                    var sourceText = ts.sys.readFile(filename);
                    return sourceText !== undefined ? ts.createSourceFile(filename, sourceText, languageVersion) : undefined;
                },
                writeFile: function (filename, text) {
                    compiledFiles[filename] = text;
                },
                getDefaultLibFileName: function () {
                    return ts.getDefaultLibFilePath(context.options);
                },
                useCaseSensitiveFileNames: function () {
                    return ts.sys.useCaseSensitiveFileNames;
                },
                getCanonicalFileName: function (filename) {
                    return ts.sys.useCaseSensitiveFileNames ? filename : filename.toLowerCase();
                },
                getCurrentDirectory: function () {
                    return ts.sys.getCurrentDirectory();
                },
                getNewLine: function () {
                    return newLine;
                },
                fileExists: function (filename) {
                    return ts.sys.fileExists(filename);
                }
            };

        program = ts.createProgram(Object.keys(context.files), context.options, compilerHost);

        ts.getPreEmitDiagnostics(program).forEach(function(diagnostic){
            log.warn("TS:%s %s", diagnostic.code, diagnostic.messageText);
        });

        program.emit();
    }
}

module.exports = Compiler;
