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
                config: _this.config,
                filename: queued.file.originalPath,
                module: queued.file.originalPath,
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
                                fileName: context.filename
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
            config: this.config,
            filename: requiredModule.filename,
            js: {
                ast: requiredModule.ast
            },
            module: requiredModule.moduleName,
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
