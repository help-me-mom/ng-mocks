function Compiler() {

    var ts = require("typescript"),
        basePath,
        existingOptions,
        tsconfig,
        log,
        program,
        compiledFiles = {},
        sourceFileCache = {};

    function compileProject(_basePath, _existingOptions, _log) {

        basePath = _basePath;
        existingOptions = _existingOptions;
        log = _log;

        log.info("Compiling project using Typescript %s", ts.version);

        resolveTsconfig();
        compile();
    }

    function compileFile(filename, originalFilename) {

        var sourceFile = sourceFileCache[originalFilename];

        if(!sourceFile) {

            throw new Error("No source found for " + originalFilename + "! Is there a mismatch between the Typescript compiler options and the Karma config?");
        }

        if(sourceFile.version !== 0) {

            log.debug("Changed: %s", originalFilename);
            compile(originalFilename);
        }

        sourceFile.version++;

        return {
            outputText: compiledFiles[filename],
            sourceMapText: compiledFiles[filename + ".map"],
            imports: sourceFileCache[originalFilename].imports
        };
    }

    function resolveTsconfig() {

        var configFileName = ts.findConfigFile(basePath, ts.sys.fileExists) || "",
            configFileText,
            configFileJson = {
                config: {}
            };

        if(configFileName) {

            configFileText = ts.sys.readFile(configFileName);
            configFileJson = ts.parseConfigFileTextToJson(configFileName, configFileText);
        }

        tsconfig = ts.parseJsonConfigFileContent(configFileJson.config, ts.sys, ts.getDirectoryPath(configFileName), existingOptions, configFileName);

        delete tsconfig.options.outDir;
        delete tsconfig.options.outFile;

        outputDiagnostics(tsconfig.errors);
    }

    function compile(originalFilename) {

        var start = benchmark(),
            compilerHost = {
                getSourceFile: function(filename, languageVersion) {
                    return getSourceFile(filename, originalFilename, languageVersion);
                },
                writeFile: function(filename, text) {
                    compiledFiles[filename] = text;
                },
                getDefaultLibFileName: function() {
                    return ts.getDefaultLibFilePath(tsconfig.options);
                },
                useCaseSensitiveFileNames: function() {
                    return ts.sys.useCaseSensitiveFileNames;
                },
                getCanonicalFileName: function (filename) {
                    return ts.sys.useCaseSensitiveFileNames ? filename : filename.toLowerCase();
                },
                getCurrentDirectory: function() {
                    return basePath;
                },
                getNewLine: function() {
                    return ts.getNewLineCharacter(tsconfig.options);
                },
                fileExists: function(filename) {
                    return ts.sys.fileExists(filename);
                }
            };

        program = ts.createProgram(tsconfig.fileNames, tsconfig.options, compilerHost, program);

        runDiagnostics(program, compilerHost);

        program.emit();

        log.info("Compiled %s files in %s ms.", tsconfig.fileNames.length, benchmark(start));
    }

    function getSourceFile(filename, originalFilename, languageVersion) {

        var absolutePath = ts.getNormalizedAbsolutePath(filename, ts.sys.getCurrentDirectory()),
            cachedItem = sourceFileCache[absolutePath],
            sourceText,
            sourceFile;

        if(cachedItem && originalFilename === absolutePath) {
            log.debug("Deleted from cache: %s", absolutePath);
            delete cachedItem.sourceFile;
        }

        if(cachedItem && cachedItem.sourceFile) {
            log.debug("Using cached version: %s", absolutePath);
            return cachedItem.sourceFile;
        }

        log.debug("Compiling: %s", absolutePath);

        sourceText = ts.sys.readFile(absolutePath);
        sourceFile = ts.createSourceFile(absolutePath, sourceText, languageVersion);

        sourceFileCache[absolutePath] = {
            sourceFile: sourceFile,
            imports: getImports(sourceFile),
            version: cachedItem ? cachedItem.version : 0
        };

        return sourceFile;
    }

    function getImports(sourceFile) {

        var imports = [];

        sourceFile.statements.forEach(function(statement){

            if(statement.moduleSpecifier) {

                imports.push(statement.moduleSpecifier.text);
            }
        });

        return imports;
    }

    function runDiagnostics(program, host) {

        var diagnostics = ts.getPreEmitDiagnostics(program);

        outputDiagnostics(diagnostics, host);
    }

    function outputDiagnostics(diagnostics, host) {

        if(diagnostics && diagnostics.length > 0) {

            diagnostics.forEach(function(diagnostic){
                log.error(ts.formatDiagnostics([diagnostic], host));
            });

            if(tsconfig.options.noEmitOnError) {

                ts.sys.exit(ts.ExitStatus.DiagnosticsPresent_OutputsSkipped);
            }
        }
    }

    function benchmark(start) {

        if(!start) {
            return process.hrtime();
        }

        var end = process.hrtime(start);
        return Math.round((end[0]*1000) + (end[1]/1000000));
    }

    this.compileProject = compileProject;
    this.compileFile = compileFile;
}

module.exports = Compiler;
