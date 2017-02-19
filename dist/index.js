"use strict";
var Bundler = require("./bundler/bundler");
var Compiler = require("./compiler/compiler");
var Configuration = require("./shared/configuration");
var Coverage = require("./istanbul/coverage");
var DependencyWalker = require("./bundler/dependency-walker");
var Framework = require("./karma/framework");
var Preprocessor = require("./karma/preprocessor");
var Reporter = require("./karma/reporter");
var Transformer = require("./bundler/transformer");
var sharedProcessedFiles = {};
var configuration = new Configuration();
var dependencyWalker = new DependencyWalker();
var transformer = new Transformer(configuration);
var coverage = new Coverage(configuration);
var bundler = new Bundler(configuration, dependencyWalker, transformer);
var compiler = new Compiler();
var framework = new Framework(bundler, compiler, configuration, coverage, dependencyWalker, transformer);
var preprocessor = new Preprocessor(bundler, compiler, configuration, coverage, sharedProcessedFiles);
var reporter = new Reporter(configuration, sharedProcessedFiles);
module.exports = {
    "framework:karma-typescript": ["factory", framework.create],
    "preprocessor:karma-typescript": ["factory", preprocessor.create],
    "reporter:karma-typescript": ["type", reporter.create]
};
