"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var istanbul = require("istanbul");
var minimatch = require("minimatch");
var path = require("path");
var lodash_1 = require("lodash");
var log4js = require("log4js");
var Threshold = (function () {
    function Threshold(config) {
        this.config = config;
    }
    Threshold.prototype.check = function (browser, collector) {
        var _this = this;
        this.log = this.log || log4js.getLogger("threshold.karma-typescript");
        var thresholdConfig = this.config.coverageOptions.threshold;
        var finalCoverage = collector.getFinalCoverage();
        var globalCoverage = this.excludeFiles(finalCoverage, thresholdConfig.global.excludes);
        var globalResults = istanbul.utils.summarizeCoverage(globalCoverage);
        var passedThreshold = true;
        var checkThresholds = function (name, thresholds, results) {
            ["branches", "functions", "lines", "statements"].forEach(function (key) {
                var result = results[key];
                var uncovered = result.total - result.covered;
                var threshold = thresholds[key];
                if (threshold < 0 && threshold * -1 < uncovered) {
                    passedThreshold = false;
                    _this.log.error("%s: Expected max %s uncovered %s, got %s (%s)", browser.name, (-1 * threshold), key, uncovered, name);
                }
                else if (result.pct < threshold) {
                    passedThreshold = false;
                    _this.log.error("%s: Expected %s% coverage for %s, got %s% (%s)", browser.name, threshold, key, result.pct, name);
                }
            });
        };
        checkThresholds("global", thresholdConfig.global, globalResults);
        Object.keys(finalCoverage).forEach(function (filename) {
            var relativeFilename = _this.getRelativePath(filename);
            var excludes = _this.config.coverageOptions.threshold.file.excludes;
            if (!_this.isExcluded(relativeFilename, excludes)) {
                var fileResult = istanbul.utils.summarizeFileCoverage(finalCoverage[filename]);
                var thresholds = lodash_1.merge(thresholdConfig.file, _this.getFileOverrides(relativeFilename));
                checkThresholds(filename, thresholds, fileResult);
            }
        });
        return passedThreshold;
    };
    Threshold.prototype.excludeFiles = function (coverage, excludes) {
        var _this = this;
        var result = {};
        Object.keys(coverage).forEach(function (filename) {
            if (!_this.isExcluded(_this.getRelativePath(filename), excludes)) {
                result[filename] = coverage[filename];
            }
        });
        return result;
    };
    Threshold.prototype.isExcluded = function (relativeFilename, excludes) {
        return excludes.some(function (pattern) {
            return minimatch(relativeFilename, pattern, { dot: true });
        });
    };
    Threshold.prototype.getFileOverrides = function (relativeFilename) {
        var thresholds = {};
        var overrides = this.config.coverageOptions.threshold.file.overrides;
        Object.keys(overrides).forEach(function (pattern) {
            if (minimatch(relativeFilename, pattern, { dot: true })) {
                thresholds = overrides[pattern];
            }
        });
        return thresholds;
    };
    Threshold.prototype.getRelativePath = function (filename) {
        var relativePath = path.isAbsolute(filename) ?
            path.relative(this.config.karma.basePath, filename) :
            filename;
        return path.normalize(relativePath);
    };
    return Threshold;
}());
exports.Threshold = Threshold;
