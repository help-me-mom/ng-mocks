var Bundler = require("./lib/bundler"),
    Compiler = require("./lib/compiler"),
    Configuration = require("./lib/configuration"),

    Framework = require("./lib/framework"),
    Preprocessor = require("./lib/preprocessor"),
    Reporter = require("./lib/reporter"),

    sharedProcessedFiles = {},

    configuration = new Configuration(),
    bundler = new Bundler(configuration),
    compiler = new Compiler(),

    framework = new Framework(bundler, compiler, configuration),
    preprocessor = new Preprocessor(bundler, compiler, configuration, sharedProcessedFiles),
    reporter = new Reporter(configuration, sharedProcessedFiles);

module.exports = {
    "framework:karma-typescript": ["factory", framework.create],
    "preprocessor:karma-typescript": ["factory", preprocessor.create],
    "reporter:karma-typescript": ["type", reporter.create]
};
