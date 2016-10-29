var Bundler = require("./lib/bundler"),
    Compiler = require("./lib/compiler"),
    NodeModulesLoader = require("./lib/karma-wide-load/node-modules-loader"),

    Framework = require("./lib/framework"),
    Preprocessor = require("./lib/preprocessor"),
    Reporter = require("./lib/reporter"),

    sharedProcessedFiles = {},

    bundler = new Bundler(),
    compiler = new Compiler(),
    loader = new NodeModulesLoader(),

    framework = new Framework(bundler, compiler, loader),
    preprocessor = new Preprocessor(bundler, compiler, loader, sharedProcessedFiles),
    reporter = new Reporter(sharedProcessedFiles);

module.exports = {
    "framework:karma-typescript": ["factory", framework.create],
    "preprocessor:karma-typescript": ["factory", preprocessor.create],
    "reporter:karma-typescript": ["type", reporter.create]
};
