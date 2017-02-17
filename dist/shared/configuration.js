"use strict";
var Configuration = (function () {
    function Configuration() {
    }
    Configuration.prototype.initialize = function (config, logger) {
        this.log = logger.create("configuration.karma-typescript");
        this.karma = this.defaultTo(config, {});
        this.karmaTypescriptConfig = this.defaultTo(config.karmaTypescriptConfig, {});
        this.configureBundler();
        this.configureFramework();
        this.configurePreprocessor();
        this.configureReporter();
        this.configureTransforms();
        this.configureKarmaCoverage();
        this.assertConfiguration();
        this.log.debug(this.toString());
    };
    Configuration.prototype.hasFramework = function (name) {
        return this.karma.frameworks.indexOf(name) !== -1;
    };
    Configuration.prototype.hasPreprocessor = function (name) {
        for (var preprocessor in this.karma.preprocessors) {
            if (this.karma.preprocessors[preprocessor] &&
                this.karma.preprocessors[preprocessor].indexOf(name) !== -1) {
                return true;
            }
        }
        return false;
    };
    Configuration.prototype.hasReporter = function (name) {
        return this.karma.reporters.indexOf(name) !== -1;
    };
    Configuration.prototype.configureBundler = function () {
        this.bundlerOptions = this.defaultTo(this.karmaTypescriptConfig.bundlerOptions, {});
        this.bundlerOptions.addNodeGlobals = this.defaultTo(this.bundlerOptions.addNodeGlobals, true);
        this.bundlerOptions.entrypoints = this.defaultTo(this.bundlerOptions.entrypoints, /.*/);
        this.bundlerOptions.exclude = this.defaultTo(this.bundlerOptions.exclude, []);
        this.bundlerOptions.ignore = this.defaultTo(this.bundlerOptions.ignore, []);
        this.bundlerOptions.noParse = this.defaultTo(this.bundlerOptions.noParse, []);
        this.bundlerOptions.resolve = this.defaultTo(this.bundlerOptions.resolve, {});
        this.bundlerOptions.resolve.alias = this.defaultTo(this.bundlerOptions.resolve.alias, {});
        this.bundlerOptions.resolve.extensions =
            this.defaultTo(this.bundlerOptions.resolve.extensions, [".js", ".json", ".ts", ".tsx"]);
        this.bundlerOptions.resolve.directories =
            this.defaultTo(this.bundlerOptions.resolve.directories, ["node_modules"]);
        this.bundlerOptions.validateSyntax = this.defaultTo(this.bundlerOptions.validateSyntax, true);
    };
    Configuration.prototype.configureFramework = function () {
        this.compilerOptions = this.karmaTypescriptConfig.compilerOptions;
        this.defaultTsconfig = {
            compilerOptions: {
                emitDecoratorMetadata: true,
                experimentalDecorators: true,
                jsx: "react",
                module: "commonjs",
                sourceMap: true,
                target: "ES5"
            },
            exclude: ["node_modules"]
        };
        this.exclude = this.karmaTypescriptConfig.exclude;
        this.include = this.karmaTypescriptConfig.include;
        this.tsconfig = this.karmaTypescriptConfig.tsconfig;
    };
    Configuration.prototype.configurePreprocessor = function () {
        this.coverageOptions = this.defaultTo(this.karmaTypescriptConfig.coverageOptions, {});
        this.coverageOptions.instrumentation = this.defaultTo(this.coverageOptions.instrumentation, true);
        this.coverageOptions.exclude = this.defaultTo(this.assertCoverageExclude(this.coverageOptions.exclude), /\.(d|spec|test)\.ts$/i);
        this.transformPath = this.defaultTo(this.karmaTypescriptConfig.transformPath, function (filepath) {
            return filepath.replace(/\.(ts|tsx)$/, ".js");
        });
    };
    Configuration.prototype.configureReporter = function () {
        this.reports = this.defaultTo(this.karmaTypescriptConfig.reports, { html: "coverage" });
        this.remapOptions = this.defaultTo(this.karmaTypescriptConfig.remapOptions, {});
    };
    Configuration.prototype.configureTransforms = function () {
        this.transforms = this.defaultTo(this.karmaTypescriptConfig.transforms, []);
    };
    Configuration.prototype.configureKarmaCoverage = function () {
        this.coverageReporter = this.defaultTo(this.karma.coverageReporter, {
            instrumenterOptions: {
                istanbul: { noCompact: true }
            }
        });
        if (this.karma.reporters) {
            this.reporters = this.karma.reporters.slice();
            if (this.karma.reporters.indexOf("coverage") === -1) {
                this.reporters.push("coverage");
            }
        }
        else {
            this.reporters = ["coverage"];
        }
    };
    Configuration.prototype.assertConfiguration = function () {
        if (!this.asserted) {
            this.asserted = true;
            this.assertFrameworkConfiguration();
            this.assertDeprecatedOptions();
        }
    };
    Configuration.prototype.assertFrameworkConfiguration = function () {
        if (this.hasPreprocessor("karma-typescript") &&
            (!this.karma.frameworks || this.karma.frameworks.indexOf("karma-typescript") === -1)) {
            throw new Error("Missing karma-typescript framework, please add" +
                "'frameworks: [\"karma-typescript\"]' to your Karma config");
        }
    };
    Configuration.prototype.assertDeprecatedOptions = function () {
        if (this.bundlerOptions.ignoredModuleNames) {
            this.log.warn("The option 'karmaTypescriptConfig.bundlerOptions.ignoredModuleNames' " +
                "has been deprecated and will be removed in future versions, please " +
                "use 'karmaTypescriptConfig.bundlerOptions.exclude' instead");
            this.bundlerOptions.exclude = this.bundlerOptions.ignoredModuleNames;
        }
        if (this.karmaTypescriptConfig.excludeFromCoverage !== undefined) {
            this.log.warn("The option 'karmaTypescriptConfig.excludeFromCoverage' " +
                "has been deprecated and will be removed in future versions, please " +
                "use 'karmaTypescriptConfig.coverageOptions.exclude' instead");
            this.coverageOptions.exclude = this.karmaTypescriptConfig.excludeFromCoverage;
        }
        if (this.karmaTypescriptConfig.disableCodeCoverageInstrumentation !== undefined) {
            this.log.warn("The option 'karmaTypescriptConfig.disableCodeCoverageInstrumentation' " +
                "has been deprecated and will be removed in future versions, please " +
                "use 'karmaTypescriptConfig.coverageOptions.instrumentation' instead");
            this.coverageOptions.instrumentation =
                !this.karmaTypescriptConfig.disableCodeCoverageInstrumentation;
        }
    };
    Configuration.prototype.assertCoverageExclude = function (regex) {
        var _this = this;
        if (regex instanceof RegExp || !regex) {
            return regex;
        }
        else if (Array.isArray(regex)) {
            regex.forEach(function (r) {
                if (!(r instanceof RegExp)) {
                    _this.throwCoverageExcludeError(r);
                }
            });
            return regex;
        }
        this.throwCoverageExcludeError(regex);
    };
    Configuration.prototype.throwCoverageExcludeError = function (regex) {
        throw new Error("karmaTypescriptConfig.coverageOptions.exclude " +
            "must be a single RegExp or an Array of RegExp, got [" + typeof regex + "]: " + regex);
    };
    Configuration.prototype.defaultTo = function () {
        var values = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            values[_i] = arguments[_i];
        }
        for (var _a = 0, values_1 = values; _a < values_1.length; _a++) {
            var value = values_1[_a];
            if (value !== undefined) {
                return value;
            }
        }
    };
    return Configuration;
}());
module.exports = Configuration;
