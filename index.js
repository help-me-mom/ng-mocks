var Bundler = require("./lib/bundlers/builtin/bundler"),
    Compiler = require("./lib/compiler"),

    Framework = require("./lib/framework"),
    Preprocessor = require("./lib/preprocessor"),
    JsonPreprocessor = require("./lib/json-preprocessor"),
    Reporter = require("./lib/reporter"),

    sharedProcessedFiles = {},

    bundler = new Bundler(),
    compiler = new Compiler(),

    framework = new Framework(bundler, compiler),
    preprocessor = new Preprocessor(bundler, compiler, sharedProcessedFiles),
    jsonPreprocessor = new JsonPreprocessor(bundler),
    reporter = new Reporter(sharedProcessedFiles);

module.exports = {
    "framework:karma-typescript": ["factory", framework.create],
    "preprocessor:karma-typescript": ["factory", preprocessor.create],
    "preprocessor:karma-typescript-json": ["factory", jsonPreprocessor.create],
    "reporter:karma-typescript": ["type", reporter.create]
};
