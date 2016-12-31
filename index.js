var Bundler = require("./lib/bundler"),
    Compiler = require("./lib/compiler"),

    Framework = require("./lib/framework"),
    Preprocessor = require("./lib/preprocessor"),
    Reporter = require("./lib/reporter"),

    sharedProcessedFiles = {},

    bundler = new Bundler(),
    compiler = new Compiler(),

    framework = new Framework(bundler, compiler),
    preprocessor = new Preprocessor(bundler, compiler, sharedProcessedFiles),
    reporter = new Reporter(sharedProcessedFiles);

module.exports = {
    "framework:karma-typescript": ["factory", framework.create],
    "preprocessor:karma-typescript": ["factory", preprocessor.create],
    "reporter:karma-typescript": ["type", reporter.create]
};
