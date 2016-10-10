var Compiler = require("./lib/compiler"),
    NodeModulesLoader = require("./lib/karma-wide-load/node-modules-loader"),
    Project = require("./lib/project"),
    Framework = require("./lib/framework"),
    Preprocessor = require("./lib/preprocessor"),
    Reporter = require("./lib/reporter"),

    transpiledFiles = {},

    compiler = new Compiler(),
    loader = new NodeModulesLoader(transformPath),
    project = new Project(),
    framework = new Framework(compiler, loader, project),
    preprocessor = new Preprocessor(compiler, loader, transpiledFiles, transformPath),
    reporter = new Reporter(transpiledFiles);

function transformPath(filepath) {

    return filepath.replace(/\.(ts|tsx)$/, ".js");
}

module.exports = {
    "framework:karma-typescript": ["factory", framework.create],
    "preprocessor:karma-typescript": ["factory", preprocessor.create],
    "reporter:karma-typescript": ["type", reporter.create]
};
