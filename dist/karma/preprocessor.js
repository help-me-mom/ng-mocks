"use strict";
var path = require("path");
var Preprocessor = (function () {
    function Preprocessor(bundler, compiler, config, coverage, sharedProcessedFiles) {
        var _this = this;
        this.compiler = compiler;
        this.config = config;
        this.create = function (karmaConfig, helper, logger) {
            _this.log = logger.create("preprocessor.karma-typescript");
            config.initialize(karmaConfig, logger);
            coverage.initialize(helper, logger);
            return function (content, file, done) {
                try {
                    _this.log.debug("Processing \"%s\".", file.originalPath);
                    file.path = config.transformPath(file.originalPath);
                    _this.compiler.compile(file, function (emitOutput) {
                        if (emitOutput.isDeclarationFile) {
                            done(null, " ");
                        }
                        else {
                            bundler.bundle(file, content, emitOutput, _this.shouldAddLoader(), function (bundled) {
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
        this.create.$inject = ["config", "helper", "logger"];
    }
    Preprocessor.prototype.shouldAddLoader = function () {
        return this.compiler.getModuleFormat().toLowerCase() === "commonjs" &&
            this.compiler.getRequiredModulesCount() > 0 &&
            !this.config.hasPreprocessor("commonjs");
    };
    return Preprocessor;
}());
module.exports = Preprocessor;
