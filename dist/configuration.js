function Configuration() {
    var asserted = false, karmaConfig, karmaTypescriptConfig, log, self = this;
    function initialize(config, logger) {
        log = logger.create("configuration.karma-typescript");
        karmaConfig = defaultTo(config, {});
        karmaTypescriptConfig = defaultTo(config.karmaTypescriptConfig, {});
        self.karma = karmaConfig;
        configureBundler();
        configureFramework();
        configurePreprocessor();
        configureReporter();
        configureTransforms();
        configureKarmaCoverage();
        assertConfiguration();
        log.debug(self);
    }
    function configureBundler() {
        self.bundlerOptions = defaultTo(karmaTypescriptConfig.bundlerOptions, {});
        self.bundlerOptions.addNodeGlobals = defaultTo(self.bundlerOptions.addNodeGlobals, true);
        self.bundlerOptions.entrypoints = defaultTo(self.bundlerOptions.entrypoints, /.*/);
        self.bundlerOptions.exclude = defaultTo(self.bundlerOptions.exclude, []);
        self.bundlerOptions.ignore = defaultTo(self.bundlerOptions.ignore, []);
        self.bundlerOptions.noParse = defaultTo(self.bundlerOptions.noParse, []);
        self.bundlerOptions.resolve = defaultTo(self.bundlerOptions.resolve, {});
        self.bundlerOptions.resolve.alias = defaultTo(self.bundlerOptions.resolve.alias, {});
        self.bundlerOptions.resolve.extensions = defaultTo(self.bundlerOptions.resolve.extensions, [".js", ".json"]);
        self.bundlerOptions.resolve.directories = defaultTo(self.bundlerOptions.resolve.directories, ["node_modules"]);
        self.bundlerOptions.validateSyntax = defaultTo(self.bundlerOptions.validateSyntax, true);
    }
    function configureFramework() {
        self.compilerOptions = karmaTypescriptConfig.compilerOptions;
        self.defaultTsconfig = {
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
        self.exclude = karmaTypescriptConfig.exclude;
        self.include = karmaTypescriptConfig.include;
        self.tsconfig = karmaTypescriptConfig.tsconfig;
    }
    function configureTransforms() {
        self.transforms = defaultTo(karmaTypescriptConfig.transforms, []);
    }
    function configurePreprocessor() {
        self.coverageOptions = defaultTo(karmaTypescriptConfig.coverageOptions, {});
        self.coverageOptions.instrumentation = defaultTo(self.coverageOptions.instrumentation, true);
        self.coverageOptions.exclude = defaultTo(checkCoverageOptionExclude(self.coverageOptions.exclude), /\.(d|spec|test)\.ts/i);
        self.transformPath = defaultTo(karmaTypescriptConfig.transformPath, function (filepath) {
            return filepath.replace(/\.(ts|tsx)$/, ".js");
        });
    }
    function configureReporter() {
        self.reports = defaultTo(karmaTypescriptConfig.reports, { html: "coverage" });
        self.remapOptions = defaultTo(karmaTypescriptConfig.remapOptions, {});
    }
    function configureKarmaCoverage() {
        self.coverageReporter = defaultTo(karmaConfig.coverageReporter, {
            instrumenterOptions: {
                istanbul: { noCompact: true }
            }
        });
        if (karmaConfig.reporters) {
            self.reporters = karmaConfig.reporters.slice();
            if (karmaConfig.reporters.indexOf("coverage") === -1) {
                self.reporters.push("coverage");
            }
        }
        else {
            self.reporters = ["coverage"];
        }
    }
    function assertConfiguration() {
        if (!asserted) {
            asserted = true;
            assertFrameworkConfiguration();
            assertDeprecatedOptions();
        }
    }
    function assertFrameworkConfiguration() {
        if (hasPreprocessor("karma-typescript") &&
            (!karmaConfig.frameworks || karmaConfig.frameworks.indexOf("karma-typescript") === -1)) {
            throw new Error("Missing karma-typescript framework, please add 'frameworks: [\"karma-typescript\"]' to your Karma config");
        }
    }
    function assertDeprecatedOptions() {
        if (self.bundlerOptions.ignoredModuleNames) {
            log.warn("The option 'karmaTypescriptConfig.bundlerOptions.ignoredModuleNames' " +
                "has been deprecated and will be removed in future versions, please " +
                "use 'karmaTypescriptConfig.bundlerOptions.exclude' instead");
            self.bundlerOptions.exclude = self.bundlerOptions.ignoredModuleNames;
        }
        if (karmaTypescriptConfig.excludeFromCoverage !== undefined) {
            log.warn("The option 'karmaTypescriptConfig.excludeFromCoverage' " +
                "has been deprecated and will be removed in future versions, please " +
                "use 'karmaTypescriptConfig.coverageOptions.exclude' instead");
            self.coverageOptions.exclude = karmaTypescriptConfig.excludeFromCoverage;
        }
        if (karmaTypescriptConfig.disableCodeCoverageInstrumentation !== undefined) {
            log.warn("The option 'karmaTypescriptConfig.disableCodeCoverageInstrumentation' " +
                "has been deprecated and will be removed in future versions, please " +
                "use 'karmaTypescriptConfig.coverageOptions.instrumentation' instead");
            self.coverageOptions.instrumentation = !karmaTypescriptConfig.disableCodeCoverageInstrumentation;
        }
    }
    function hasFramework(name) {
        return karmaConfig.frameworks.indexOf(name) !== -1;
    }
    function hasPreprocessor(name) {
        for (var preprocessor in karmaConfig.preprocessors) {
            if (karmaConfig.preprocessors[preprocessor] &&
                karmaConfig.preprocessors[preprocessor].indexOf(name) !== -1) {
                return true;
            }
        }
        return false;
    }
    function hasReporter(name) {
        return karmaConfig.reporters.indexOf(name) !== -1;
    }
    function defaultTo() {
        for (var i = 0; i < arguments.length; i++) {
            if (arguments[i] !== undefined) {
                return arguments[i];
            }
        }
    }
    function checkCoverageOptionExclude(regex) {
        function throwRegexError(regex) {
            var baseErrorMsg = "karmaTypescriptConfig.coverageOptions.exclude must be a single RegExp or an Array of RegExp";
            throw new Error(baseErrorMsg + " " + regex + " is not a regex");
        }
        if (regex instanceof RegExp || !regex) {
            return regex;
        }
        else if (Array.isArray(regex)) {
            regex.forEach(function (r) {
                if (!(r instanceof RegExp)) {
                    throwRegexError(r);
                }
            });
            return regex; // else: keep going
        }
        // if it's something other, throw an error
        throwRegexError(regex);
    }
    self.initialize = initialize;
    self.hasFramework = hasFramework;
    self.hasPreprocessor = hasPreprocessor;
    self.hasReporter = hasReporter;
}
module.exports = Configuration;
