function Compiler() {

    var debounce = require("lodash.debounce"),
        ts = require("typescript"),

        benchmark = require("./benchmark"),

        compiledFiles = {},
        compilerHost,
        emitQueue = [],
        log,
        program,
        requiredModuleCounter,
        sourceFileCache = {},
        tsconfig,

        COMPILE_DELAY = 500;

    function initialize(_tsconfig, logger) {

        tsconfig = _tsconfig;
        log = logger.create("compiler.karma-typescript");

        log.info("Compiling project using Typescript %s", ts.version);

        outputDiagnostics(tsconfig.errors);
    }

    function getModuleFormat() {

        return ts.ModuleKind[tsconfig.options.module] || "unknown";
    }

    function getRequiredModulesCount() {

        return requiredModuleCounter;
    }

    function compile(file, callback) {

        flush(file);

        emitQueue.push({
            file: file,
            callback: callback
        });

        deferredCompile();
    }

    function flush(file) {

        var cachedItem = sourceFileCache[file.originalPath];

        if(cachedItem) {

            delete cachedItem.sourceFile;
        }
    }

    var deferredCompile = debounce(function() {

        emit();
        collectRequiredModules();

        emitQueue.forEach(function(queued) {

            var cachedItem = sourceFileCache[queued.file.originalPath];

            if(!cachedItem) {

                throw new Error("No source found for " + queued.file.originalPath + "!\n" +
                                "Is there a mismatch between the Typescript compiler options and the Karma config?");
            }

            queued.callback({
                outputText: compiledFiles[queued.file.path],
                sourceMapText: compiledFiles[queued.file.path + ".map"],
                requiredModules: cachedItem.requiredModules,
                isDeclarationFile: cachedItem.sourceFile.isDeclarationFile
            });
        });

        emitQueue.length = 0;

    }, COMPILE_DELAY);

    function collectRequiredModules() {

        requiredModuleCounter = 0;

        Object.keys(sourceFileCache).forEach(function(key) {

            var cachedItem = sourceFileCache[key];

            cachedItem.requiredModules = getRequiredModules(cachedItem.sourceFile);

            if(cachedItem.sourceFile.resolvedModules && !cachedItem.sourceFile.isDeclarationFile) {

                Object.keys(cachedItem.sourceFile.resolvedModules).forEach(function(moduleName) {

                    var resolvedModule = cachedItem.sourceFile.resolvedModules[moduleName];

                    cachedItem.requiredModules.push({
                        moduleName: moduleName,
                        filename: resolvedModule && !resolvedModule.isExternalLibraryImport ?
                            resolvedModule.resolvedFileName : ""
                    });
                });
            }

            requiredModuleCounter += cachedItem.requiredModules.length;
        });
    }

    function emit() {

        var start = benchmark();

        compilerHost = ts.createCompilerHost(tsconfig.options);

        compilerHost.getSourceFile = function(filename, languageVersion) {
            return getSourceFile(filename, languageVersion);
        };

        compilerHost.writeFile = function(filename, text) {
            compiledFiles[filename] = text;
        };

        program = ts.createProgram(tsconfig.fileNames, tsconfig.options, compilerHost, program);

        runDiagnostics(program, compilerHost);

        program.emit();

        log.info("Compiled %s files in %s ms.", tsconfig.fileNames.length, benchmark(start));
    }

    function getSourceFile(filename, languageVersion) {

        var absolutePath = ts.getNormalizedAbsolutePath(filename, ts.sys.getCurrentDirectory()),
            cachedItem = sourceFileCache[absolutePath],
            sourceText,
            sourceFile;

        if(cachedItem && cachedItem.sourceFile) {
            log.debug("Using cached version: %s", absolutePath);
            return cachedItem.sourceFile;
        }

        log.debug("Reading: %s", absolutePath);

        sourceText = ts.sys.readFile(absolutePath);

        if(sourceText === undefined || sourceText === null) {
            log.error("No source found for " + absolutePath);
        }

        sourceFile = ts.createSourceFile(absolutePath, sourceText, languageVersion);

        sourceFileCache[absolutePath] = {
            sourceFile: sourceFile,
            version: cachedItem ? cachedItem.version : 0
        };

        return sourceFile;
    }

    function getRequiredModules(sourceFile) {

        var requiredModules = [];

        if(sourceFile.isDeclarationFile) {
            return requiredModules;
        }

        visitNode(sourceFile);

        function visitNode(node) {

            switch (node.kind) {

            case ts.SyntaxKind.CallExpression:

                if(node.expression && node.expression.text === "require" &&
                   node.arguments && node.arguments.length) {

                    var resolvedModule = ts.resolveModuleName(
                        node.arguments[0].text, sourceFile.fileName,
                        tsconfig.options, compilerHost).resolvedModule;

                    requiredModules.push({
                        moduleName: node.arguments[0].text,
                        filename: resolvedModule && resolvedModule.resolvedFileName
                    });
                }
            }

            ts.forEachChild(node, visitNode);
        }

        return requiredModules;
    }

    function runDiagnostics(program, host) {

        var diagnostics = ts.getPreEmitDiagnostics(program);

        outputDiagnostics(diagnostics, host);
    }

    function outputDiagnostics(diagnostics, host) {

        if(diagnostics && diagnostics.length > 0) {

            diagnostics.forEach(function(diagnostic) {

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

    this.initialize = initialize;
    this.compile = compile;
    this.getModuleFormat = getModuleFormat;
    this.getRequiredModulesCount = getRequiredModulesCount;
}

module.exports = Compiler;
