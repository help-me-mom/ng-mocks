"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var Preprocessor = (function () {
    function Preprocessor(bundler, compiler, config, coverage, sharedProcessedFiles) {
        var _this = this;
        this.create = function (helper, logger) {
            _this.log = logger.create("preprocessor.karma-typescript");
            coverage.initialize(helper, logger);
            return function (content, file, done) {
                try {
                    _this.log.debug("Processing \"%s\". %s", file.originalPath, content.length);
                    file.path = config.transformPath(file.originalPath);
                    compiler.compile(file, function (emitOutput) {
                        if (emitOutput.isDeclarationFile && !emitOutput.isAmbientModule) {
                            done(null, " ");
                        }
                        else {
                            bundler.bundle(file, emitOutput, function (bundled) {
                                sharedProcessedFiles[path.normalize(file.originalPath)] = bundled;
                                coverage.instrument(file, bundled, emitOutput, function (result) {
                                    done(null, result);
                                });
                            });
                        }
                    });
                }
                catch (e) {
                    _this.log.error("%s\n processing %s\n%s", e.message, file.originalPath, e.stack);
                    done(e, null);
                }
            };
        };
        this.create.$inject = ["helper", "logger"];
    }
    return Preprocessor;
}());
exports.Preprocessor = Preprocessor;
