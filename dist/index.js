"use strict";
var Bundler = require("./bundler");
var Compiler = require("./compiler");
var Configuration = require("./configuration");
var Coverage = require("./coverage");
var Framework = require("./karma/framework");
var Preprocessor = require("./karma/preprocessor");
var Reporter = require("./karma/reporter");
var sharedProcessedFiles = {};
var configuration = new Configuration();
var coverage = new Coverage(configuration);
var bundler = new Bundler(configuration);
var compiler = new Compiler(configuration);
var framework = new Framework(bundler, compiler, configuration, coverage);
var preprocessor = new Preprocessor(bundler, compiler, configuration, coverage, sharedProcessedFiles);
var reporter = new Reporter(configuration, sharedProcessedFiles);
module.exports = {
    "framework:karma-typescript": ["factory", framework.create],
    "preprocessor:karma-typescript": ["factory", preprocessor.create],
    "reporter:karma-typescript": ["type", reporter.create]
};
