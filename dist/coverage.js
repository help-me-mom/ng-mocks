"use strict";
var SourceMap = require("./source-map");
var Coverage = (function () {
    function Coverage(config) {
        this.config = config;
        this.coverage = require("karma-coverage/lib/preprocessor");
    }
    Coverage.prototype.initialize = function (helper, logger) {
        this.log = logger.create("coverage.karma-typescript");
        this.coveragePreprocessor = this.coverage(logger, helper, this.config.karma.basePath, this.config.reporters, this.config.coverageReporter);
    };
    Coverage.prototype.instrument = function (file, bundled, emitOutput, callback) {
        if (this.config.hasPreprocessor("commonjs")) {
            this.log.debug("karma-commonjs already configured");
            callback(bundled);
            return;
        }
        if (this.config.hasPreprocessor("coverage")) {
            this.log.debug("karma-coverage already configured");
            callback(bundled);
            return;
        }
        if (!this.config.coverageOptions.instrumentation ||
            this.isExcluded(this.config.coverageOptions.exclude, file.originalPath) ||
            this.hasNoOutput(file, emitOutput)) {
            this.log.debug("Excluding file %s from instrumentation", file.originalPath);
            callback(bundled);
            return;
        }
        this.coveragePreprocessor(bundled, file, callback);
    };
    Coverage.prototype.hasNoOutput = function (file, emitOutput) {
        return emitOutput.outputText === SourceMap.getComment(file);
    };
    Coverage.prototype.isExcluded = function (regex, path) {
        if (Array.isArray(regex)) {
            for (var _i = 0, regex_1 = regex; _i < regex_1.length; _i++) {
                var r = regex_1[_i];
                if (r.test(path)) {
                    return true;
                }
            }
            return false;
        }
        return regex.test(path);
    };
    return Coverage;
}());
module.exports = Coverage;
