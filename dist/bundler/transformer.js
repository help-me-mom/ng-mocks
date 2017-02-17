"use strict";
var async = require("async");
var ts = require("typescript");
var Transformer = (function () {
    function Transformer(config) {
        this.config = config;
    }
    Transformer.prototype.initialize = function (logger, tsconfig) {
        this.tsconfig = tsconfig;
        this.log = logger.create("transformer.karma-typescript");
        this.log.info("Beep, boop");
    };
    Transformer.prototype.applyTransforms = function (bundleQueue, onTransformssApplied) {
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
                basePath: _this.config.karma.basePath,
                filename: queued.file.originalPath,
                fullText: queued.emitOutput.sourceFile.getFullText(),
                sourceFile: queued.emitOutput.sourceFile,
                urlRoot: _this.config.karma.urlRoot
            };
            async.eachSeries(transforms, function (transform, onTransformApplied) {
                process.nextTick(function () {
                    transform(context, function (changed) {
                        if (changed) {
                            var transpiled = ts.transpileModule(context.fullText, {
                                compilerOptions: _this.tsconfig.options,
                                fileName: queued.file.originalPath
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
    return Transformer;
}());
module.exports = Transformer;
