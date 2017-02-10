function Compiler(config) {

    var async = require("async"),
        debounce = require("lodash.debounce"),
        ts = require("typescript"),

        benchmark = require("./benchmark"),

        cachedProgram,
        compiledFiles = {},
        compilerHost,
        emitQueue = [],
        hostGetSourceFile,
        log,
        program,
        requiredModuleCounter,
        tsconfig,

        COMPILE_DELAY = 200;

    function initialize(logger, _tsconfig) {

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

        emitQueue.push({
            file: file,
            callback: callback
        });

        deferredCompile();
    }

    var deferredCompile = debounce(function() {

        compileProgram(onProgramCompiled);

    }, COMPILE_DELAY);

    function onProgramCompiled() {

        emitQueue.forEach(function(queued) {

            var sourceFile = program.getSourceFile(queued.file.originalPath);

            if(!sourceFile) {
                throw new Error("No source found for " + queued.file.originalPath + "!\n" +
                                "Is there a mismatch between the Typescript compiler options and the Karma config?");
            }

            queued.callback({
                outputText: compiledFiles[queued.file.path],
                sourceMapText: compiledFiles[queued.file.path + ".map"],
                requiredModules: queued.requiredModules,
                isDeclarationFile: ts.isDeclarationFile(sourceFile)
            });
        });

        emitQueue.length = 0;
    }

    function compileProgram(onProgramCompiled) {

        var start = benchmark();

        if(!cachedProgram) {
            compilerHost = ts.createCompilerHost(tsconfig.options);
            hostGetSourceFile = compilerHost.getSourceFile;
            compilerHost.getSourceFile = getSourceFile;
            compilerHost.writeFile = function(filename, text) {
                compiledFiles[filename] = text;
            };
        }

        program = ts.createProgram(tsconfig.fileNames, tsconfig.options, compilerHost);
        cachedProgram = program;

        runDiagnostics(program, compilerHost);

        program.emit();

        applyTransforms(function() {
            log.info("Compiled %s files in %s ms.", tsconfig.fileNames.length, benchmark(start));
            collectRequiredModules();
            onProgramCompiled();
        });
    }

    function getSourceFile(filename, languageVersion) {

        if(cachedProgram && !isQueued(filename)) {
            var sourceFile = cachedProgram.getSourceFile(filename);
            if (sourceFile) {
                return sourceFile;
            }
        }

        return hostGetSourceFile(filename, languageVersion);
    }

    function isQueued(filename) {
        for(var i = 0; i < emitQueue.length; i++) {
            if (emitQueue[i].file.originalPath === filename) {
                return true;
            }
        }
        return false;
    }

    function applyTransforms(onTransformssApplied) {

        if(!config.transforms.length) {
            process.nextTick(function() {
                onTransformssApplied();
            });
            return;
        }

        async.eachSeries(emitQueue, function(queued, onQueueProcessed) {
            var sourceFile = program.getSourceFile(queued.file.originalPath),
                context = {
                    basePath: config.karma.basePath,
                    filename: queued.file.originalPath,
                    fullText: sourceFile.getFullText(),
                    sourceFile: sourceFile,
                    urlRoot: config.karma.urlRoot
                }; 
            async.eachSeries(config.transforms, function(transform, onTransformApplied) {
                process.nextTick(function() {
                    transform(context, function(changed) {
                        if(changed) {
                            var transpiled = ts.transpileModule(context.fullText, {
                                compilerOptions: tsconfig.options,
                                fileName: queued.file.originalPath
                            });
                            compiledFiles[queued.file.path] = transpiled.outputText;
                            compiledFiles[queued.file.path + ".map"] = transpiled.sourceMapText;
                        }
                        onTransformApplied();
                    });
                });
            }, onQueueProcessed);
        }, onTransformssApplied);
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

    function collectRequiredModules() {

        requiredModuleCounter = 0;

        emitQueue.forEach(function(queued) {

            var sourceFile = program.getSourceFile(queued.file.originalPath);
            queued.requiredModules = findUnresolvedRequires(sourceFile);

            if(sourceFile.resolvedModules && !sourceFile.isDeclarationFile) {

                Object.keys(sourceFile.resolvedModules).forEach(function(moduleName) {

                    var resolvedModule = sourceFile.resolvedModules[moduleName];

                    queued.requiredModules.push({
                        moduleName: moduleName,
                        filename: resolvedModule && resolvedModule.resolvedFileName,
                        isTypingsFile: isTypingsFile(resolvedModule),
                        isTypescriptFile: isTypescriptFile(resolvedModule)
                    });
                });
            }

            requiredModuleCounter += queued.requiredModules.length;
        });
    }

    function findUnresolvedRequires(sourceFile) {

        var requiredModules = [];

        if(ts.isDeclarationFile(sourceFile)) {
            return requiredModules;
        }

        visitNode(sourceFile);

        function visitNode(node) {

            switch (node.kind) {
                case ts.SyntaxKind.CallExpression:

                    if(node.expression && node.expression.text === "require" &&
                       node.arguments && node.arguments.length &&
                       typeof node.arguments[0].text === "string") {

                        var resolvedModule;

                        try {
                            resolvedModule = ts.resolveModuleName(
                                node.arguments[0].text, sourceFile.fileName,
                                tsconfig.options, compilerHost).resolvedModule;
                        }
                        catch(error) {
                            resolvedModule = undefined;
                        }

                        requiredModules.push({
                            moduleName: node.arguments[0].text,
                            filename: resolvedModule && resolvedModule.resolvedFileName,
                            isTypingsFile: isTypingsFile(resolvedModule),
                            isTypescriptFile: isTypescriptFile(resolvedModule)
                        });
                    }
            }

            ts.forEachChild(node, visitNode);
        }

        return requiredModules;
    }

    function isTypingsFile(resolvedModule) {
        return resolvedModule && ts.fileExtensionIs(resolvedModule.resolvedFileName, ".d.ts");
    }

    function isTypescriptFile(resolvedModule) {
        return resolvedModule &&
               !isTypingsFile(resolvedModule) &&
               (ts.fileExtensionIs(resolvedModule.resolvedFileName, ".ts") ||
                ts.fileExtensionIs(resolvedModule.resolvedFileName, ".tsx"));
    }

    this.initialize = initialize;
    this.compile = compile;
    this.getModuleFormat = getModuleFormat;
    this.getRequiredModulesCount = getRequiredModulesCount;
}

module.exports = Compiler;
