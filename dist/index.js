"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var log4js = require("log4js");
var bundler_1 = require("./bundler/bundler");
var dependency_walker_1 = require("./bundler/dependency-walker");
var transformer_1 = require("./bundler/transformer");
var validator_1 = require("./bundler/validator");
var compiler_1 = require("./compiler/compiler");
var project_1 = require("./compiler/project");
var coverage_1 = require("./istanbul/coverage");
var threshold_1 = require("./istanbul/threshold");
var framework_1 = require("./karma/framework");
var preprocessor_1 = require("./karma/preprocessor");
var reporter_1 = require("./karma/reporter");
var configuration_1 = require("./shared/configuration");
var sharedProcessedFiles = {};
var configuration = new configuration_1.Configuration(log4js.getLogger("configuration.karma-typescript"));
var dependencyWalker = new dependency_walker_1.DependencyWalker(log4js.getLogger("dependency-walker.karma-typescript"));
var transformer = new transformer_1.Transformer(configuration, log4js.getLogger("transformer.karma-typescript"));
var validator = new validator_1.Validator(configuration);
var coverage = new coverage_1.Coverage(configuration);
var bundler = new bundler_1.Bundler(configuration, dependencyWalker, log4js.getLogger("bundler.karma-typescript"), transformer, validator);
var compiler = new compiler_1.Compiler(log4js.getLogger("compiler.karma-typescript"));
var project = new project_1.Project(configuration, log4js.getLogger("project.karma-typescript"));
var threshold = new threshold_1.Threshold(configuration, log4js.getLogger("threshold.karma-typescript"));
var framework = new framework_1.Framework(bundler, compiler, configuration, coverage, project, transformer);
var preprocessor = new preprocessor_1.Preprocessor(bundler, compiler, configuration, coverage, sharedProcessedFiles);
var reporter = new reporter_1.Reporter(configuration, sharedProcessedFiles, threshold);
module.exports = {
    "framework:karma-typescript": ["factory", framework.create],
    "preprocessor:karma-typescript": ["factory", preprocessor.create],
    "reporter:karma-typescript": ["type", reporter.create]
};
