"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var async = require("async");
var os = require("os");
var ts = require("typescript");
var Transformer = (function () {
    function Transformer(config, log) {
        this.config = config;
        this.log = log;
    }
    Transformer.prototype.initialize = function (tsconfig) {
        this.tsconfig = tsconfig;
        this.log.debug("initialize");
    };
    Transformer.prototype.applyTsTransforms = function (bundleQueue, onTransformssApplied) {
        var _this = this;
        var transforms = this.config.bundlerOptions.transforms;
        if (!transforms.length) {
            process.nextTick(function () {
                onTransformssApplied();
            });
            return;
        }
        async.eachSeries(bundleQueue, function (queued, onQueueProcessed) {
            var context = {
                log: {
                    appenders: _this.config.karma.loggers,
                    level: _this.config.karma.logLevel
                },
                module: queued.file.originalPath,
                paths: {
                    basepath: _this.config.karma.basePath,
                    filename: queued.file.originalPath,
                    urlroot: _this.config.karma.urlRoot
                },
                source: queued.emitOutput.sourceFile.getFullText(),
                ts: {
                    ast: queued.emitOutput.sourceFile,
                    version: ts.version
                }
            };
            async.eachSeries(transforms, function (transform, onTransformApplied) {
                process.nextTick(function () {
                    transform(context, function (error, dirty) {
                        _this.handleError(error, transform);
                        if (dirty) {
                            var transpiled = ts.transpileModule(context.source, {
                                compilerOptions: _this.tsconfig.options,
                                fileName: context.paths.filename
                            });
                            queued.emitOutput.outputText = transpiled.outputText;
                            queued.emitOutput.sourceMapText = transpiled.sourceMapText;
                        }
                        onTransformApplied();
                    });
                });
            }, onQueueProcessed);
        }, onTransformssApplied);
    };
    Transformer.prototype.applyTransforms = function (requiredModule, onTransformssApplied) {
        var _this = this;
        var transforms = this.config.bundlerOptions.transforms;
        if (!transforms.length) {
            process.nextTick(function () {
                onTransformssApplied();
            });
            return;
        }
        var context = {
            js: {
                ast: requiredModule.ast
            },
            log: {
                appenders: this.config.karma.loggers,
                level: this.config.karma.logLevel
            },
            module: requiredModule.moduleName,
            paths: {
                basepath: this.config.karma.basePath,
                filename: requiredModule.filename,
                urlroot: this.config.karma.urlRoot
            },
            source: requiredModule.source
        };
        async.eachSeries(transforms, function (transform, onTransformApplied) {
            process.nextTick(function () {
                transform(context, function (error, dirty) {
                    _this.handleError(error, transform);
                    if (dirty) {
                        requiredModule.ast = context.js.ast;
                        requiredModule.source = context.source;
                    }
                    onTransformApplied();
                });
            });
        }, onTransformssApplied);
    };
    Transformer.prototype.handleError = function (error, transform) {
        if (error) {
            throw new Error("Unable to run transform: " + os.EOL + os.EOL +
                transform + os.EOL + os.EOL +
                "callback error parameter: " + error + os.EOL);
        }
    };
    return Transformer;
}());
exports.Transformer = Transformer;
