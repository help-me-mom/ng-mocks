var NodeModulesLoader = require("./lib/karma-wide-load/node-modules-loader"),
    Framework = require("./lib/framework"),
    Preprocessor = require("./lib/preprocessor"),
    Reporter = require("./lib/reporter"),

    transpiledFiles = {},

    loader = new NodeModulesLoader(transformPath),
    framework = new Framework(loader),
    preprocessor = new Preprocessor(loader, transpiledFiles, transformPath),
    reporter = new Reporter(transpiledFiles);

function transformPath(filepath) {

    return filepath.replace(/\.(ts|tsx)$/, ".js");
}

module.exports = {
    "framework:karma-typescript": ["factory", framework.create],
    "preprocessor:karma-typescript": ["factory", preprocessor.create],
    "reporter:karma-typescript": ["type", reporter.create]
};
