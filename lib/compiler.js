function Compiler() {

    var ts = require("typescript"),
        basePath,
        tsconfig,
        log,
        program,
        compiledFiles = {},
        sourceFileCache = {},
        importCounter;

    function compileProject(_basePath, _tsconfig, _log) {

        basePath = _basePath;
        tsconfig = _tsconfig;
        log = _log;

        log.info("Compiling project using Typescript %s", ts.version);

        outputDiagnostics(tsconfig.errors);
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

    function getModuleFormat() {

        return ts.ModuleKind[tsconfig.options.module] || "unknown";
    }

    function getImportCount() {

        return importCounter;
    }

    function compile(originalFilename) {

        var start = benchmark(),
            compilerHost = ts.createCompilerHost(tsconfig.options);

        compilerHost.getSourceFile = function(filename, languageVersion) {
            return getSourceFile(filename, originalFilename, languageVersion);
        };

        compilerHost.writeFile = function(filename, text) {
            compiledFiles[filename] = text;
        };

        compilerHost.getCurrentDirectory = function() {
            return basePath;
        };

        program = ts.createProgram(tsconfig.fileNames, tsconfig.options, compilerHost, program);

        runDiagnostics(program, compilerHost);

        program.emit();

        countImports();

        log.info("Compiled %s files in %s ms.", tsconfig.fileNames.length, benchmark(start));
    }

    function countImports() {

        importCounter = 0;

        Object.keys(sourceFileCache).forEach(function(key) {

            importCounter += getImports(sourceFileCache[key].sourceFile).length;
        });
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

        if(!sourceText) {
            log.error("No source found for " + absolutePath);
        }

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

                if(ts.formatDiagnostics) { // v1.8+

                    log.error(ts.formatDiagnostics([diagnostic], host));
                }
                else { // v1.6, v1.7

                    var output = "";

                    if (diagnostic.file) {
                        var loc = ts.getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start);
                        output += diagnostic.file.fileName.replace(process.cwd(), "") + "(" + (loc.line + 1) + "," + (loc.character + 1) + "): ";
                    }

                    var category = ts.DiagnosticCategory[diagnostic.category].toLowerCase();
                    output += category + " TS" + diagnostic.code + ": " + ts.flattenDiagnosticMessageText(diagnostic.messageText, ts.sys.newLine) + ts.sys.newLine;

                    log.error(output);
                }
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
    this.getModuleFormat = getModuleFormat;
    this.getImportCount = getImportCount;
}

module.exports = Compiler;
