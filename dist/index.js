"use strict";
var bundler_1 = require("./bundler/bundler");
var dependency_walker_1 = require("./bundler/dependency-walker");
var transformer_1 = require("./bundler/transformer");
var validator_1 = require("./bundler/validator");
var compiler_1 = require("./compiler/compiler");
var coverage_1 = require("./istanbul/coverage");
var framework_1 = require("./karma/framework");
var preprocessor_1 = require("./karma/preprocessor");
var reporter_1 = require("./karma/reporter");
var configuration_1 = require("./shared/configuration");
var sharedProcessedFiles = {};
var configuration = new configuration_1.Configuration();
var dependencyWalker = new dependency_walker_1.DependencyWalker();
var transformer = new transformer_1.Transformer(configuration);
var validator = new validator_1.Validator(configuration);
var coverage = new coverage_1.Coverage(configuration);
var bundler = new bundler_1.Bundler(configuration, dependencyWalker, transformer, validator);
var compiler = new compiler_1.Compiler();
var framework = new framework_1.Framework(bundler, compiler, configuration, coverage, dependencyWalker, transformer);
var preprocessor = new preprocessor_1.Preprocessor(bundler, compiler, configuration, coverage, sharedProcessedFiles);
var reporter = new reporter_1.Reporter(configuration, sharedProcessedFiles);
module.exports = {
    "framework:karma-typescript": ["factory", framework.create],
    "preprocessor:karma-typescript": ["factory", preprocessor.create],
    "reporter:karma-typescript": ["type", reporter.create]
};
