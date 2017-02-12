"use strict";
var async = require("async");
var lodash = require("lodash");
var ts = require("typescript");
var Benchmark = require("./benchmark");
var RequiredModule = require("./required-module");
var Compiler = (function () {
    function Compiler(config) {
        var _this = this;
        this.COMPILE_DELAY = 200;
        this.compiledFiles = {};
        this.emitQueue = [];
        this.deferredCompile = lodash.debounce(function () {
            _this.compileProgram(_this.onProgramCompiled);
        }, this.COMPILE_DELAY);
        this.onProgramCompiled = function () {
            _this.emitQueue.forEach(function (queued) {
                var sourceFile = _this.program.getSourceFile(queued.file.originalPath);
                if (!sourceFile) {
                    throw new Error("No source found for " + queued.file.originalPath + "!\n" +
                        "Is there a mismatch between the Typescript compiler options and the Karma config?");
                }
                queued.callback({
                    isDeclarationFile: ts.isDeclarationFile(sourceFile),
                    outputText: _this.compiledFiles[queued.file.path],
                    requiredModules: queued.requiredModules,
                    sourceMapText: _this.compiledFiles[queued.file.path + ".map"]
                });
            });
            _this.emitQueue.length = 0;
        };
        this.getSourceFile = function (filename, languageVersion, onError) {
            if (_this.cachedProgram && !_this.isQueued(filename)) {
                var sourceFile = _this.cachedProgram.getSourceFile(filename);
                if (sourceFile) {
                    return sourceFile;
                }
            }
            return _this.hostGetSourceFile(filename, languageVersion, onError);
        };
        this.config = config;
    }
    Compiler.prototype.initialize = function (logger, tsconfig) {
        this.tsconfig = tsconfig;
        this.log = logger.create("compiler.karma-typescript");
        this.log.info("Compiling project using Typescript %s", ts.version);
        this.outputDiagnostics(tsconfig.errors);
    };
    Compiler.prototype.getModuleFormat = function () {
        return ts.ModuleKind[this.tsconfig.options.module] || "unknown";
    };
    Compiler.prototype.getRequiredModulesCount = function () {
        return this.requiredModuleCounter;
    };
    Compiler.prototype.compile = function (file, callback) {
        this.emitQueue.push({
            file: file,
            callback: callback
        });
        this.deferredCompile();
    };
    Compiler.prototype.compileProgram = function (onProgramCompiled) {
        var _this = this;
        var benchmark = new Benchmark();
        if (!this.cachedProgram) {
            this.compilerHost = ts.createCompilerHost(this.tsconfig.options);
            this.hostGetSourceFile = this.compilerHost.getSourceFile;
            this.compilerHost.getSourceFile = this.getSourceFile;
            this.compilerHost.writeFile = function (filename, text) {
                _this.compiledFiles[filename] = text;
            };
        }
        this.program = ts.createProgram(this.tsconfig.fileNames, this.tsconfig.options, this.compilerHost);
        this.cachedProgram = this.program;
        this.runDiagnostics(this.program, this.compilerHost);
        this.program.emit();
        this.applyTransforms(function () {
            _this.log.info("Compiled %s files in %s ms.", _this.tsconfig.fileNames.length, benchmark.elapsed());
            _this.collectRequiredModules();
            onProgramCompiled();
        });
    };
    Compiler.prototype.isQueued = function (filename) {
        for (var _i = 0, _a = this.emitQueue; _i < _a.length; _i++) {
            var queued = _a[_i];
            if (queued.file.originalPath === filename) {
                return true;
            }
        }
        return false;
    };
    Compiler.prototype.applyTransforms = function (onTransformssApplied) {
        var _this = this;
        if (!this.config.transforms.length) {
            process.nextTick(function () {
                onTransformssApplied();
            });
            return;
        }
        async.eachSeries(this.emitQueue, function (queued, onQueueProcessed) {
            var sourceFile = _this.program.getSourceFile(queued.file.originalPath);
            var context = {
                basePath: _this.config.karma.basePath,
                filename: queued.file.originalPath,
                fullText: sourceFile.getFullText(),
                sourceFile: sourceFile,
                urlRoot: _this.config.karma.urlRoot
            };
            async.eachSeries(_this.config.transforms, function (transform, onTransformApplied) {
                process.nextTick(function () {
                    transform(context, function (changed) {
                        if (changed) {
                            var transpiled = ts.transpileModule(context.fullText, {
                                compilerOptions: _this.tsconfig.options,
                                fileName: queued.file.originalPath
                            });
                            _this.compiledFiles[queued.file.path] = transpiled.outputText;
                            _this.compiledFiles[queued.file.path + ".map"] = transpiled.sourceMapText;
                        }
                        onTransformApplied();
                    });
                });
            }, onQueueProcessed);
        }, onTransformssApplied);
    };
    Compiler.prototype.runDiagnostics = function (program, host) {
        var diagnostics = ts.getPreEmitDiagnostics(program);
        this.outputDiagnostics(diagnostics, host);
    };
    Compiler.prototype.outputDiagnostics = function (diagnostics, host) {
        var _this = this;
        if (diagnostics && diagnostics.length > 0) {
            diagnostics.forEach(function (diagnostic) {
                if (ts.formatDiagnostics) {
                    _this.log.error(ts.formatDiagnostics([diagnostic], host));
                }
                else {
                    var output = "";
                    if (diagnostic.file) {
                        var loc = ts.getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start);
                        output += diagnostic.file.fileName.replace(process.cwd(), "") +
                            "(" + (loc.line + 1) + "," + (loc.character + 1) + "): ";
                    }
                    var category = ts.DiagnosticCategory[diagnostic.category].toLowerCase();
                    output += category + " TS" + diagnostic.code + ": " +
                        ts.flattenDiagnosticMessageText(diagnostic.messageText, ts.sys.newLine) + ts.sys.newLine;
                    _this.log.error(output);
                }
            });
            if (this.tsconfig.options.noEmitOnError) {
                ts.sys.exit(ts.ExitStatus.DiagnosticsPresent_OutputsSkipped);
            }
        }
    };
    Compiler.prototype.collectRequiredModules = function () {
        var _this = this;
        this.requiredModuleCounter = 0;
        this.emitQueue.forEach(function (queued) {
            var sourceFile = _this.program.getSourceFile(queued.file.originalPath);
            queued.requiredModules = _this.findUnresolvedRequires(sourceFile);
            if (sourceFile.resolvedModules && !sourceFile.isDeclarationFile) {
                Object.keys(sourceFile.resolvedModules).forEach(function (moduleName) {
                    var resolvedModule = sourceFile.resolvedModules[moduleName];
                    queued.requiredModules.push(new RequiredModule(resolvedModule && resolvedModule.resolvedFileName, moduleName));
                });
            }
            _this.requiredModuleCounter += queued.requiredModules.length;
        });
    };
    Compiler.prototype.findUnresolvedRequires = function (sourceFile) {
        var requiredModules = [];
        if (ts.isDeclarationFile(sourceFile)) {
            return requiredModules;
        }
        var visitNode = function (node) {
            if (node.kind === ts.SyntaxKind.CallExpression) {
                var ce = node;
                var expression = ce.expression ?
                    ce.expression :
                    undefined;
                var argument = ce.arguments && ce.arguments.length ?
                    ce.arguments[0] :
                    undefined;
                if (expression && expression.text === "require" &&
                    argument && typeof argument.text === "string") {
                    requiredModules.push(new RequiredModule(undefined, argument.text));
                }
            }
            ts.forEachChild(node, visitNode);
        };
        visitNode(sourceFile);
        return requiredModules;
    };
    return Compiler;
}());
module.exports = Compiler;
