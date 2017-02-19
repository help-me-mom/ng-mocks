import Bundler = require("./bundler/bundler");
import Compiler = require("./compiler/compiler");
import Configuration = require("./shared/configuration");
import Coverage = require("./istanbul/coverage");
import DependencyWalker = require("./bundler/dependency-walker");
import Framework = require("./karma/framework");
import Preprocessor = require("./karma/preprocessor");
import Reporter = require("./karma/reporter");
import SharedProcessedFiles = require("./shared/shared-processed-files");
import Transformer = require("./bundler/transformer");

let sharedProcessedFiles: SharedProcessedFiles = {};

let configuration = new Configuration();
let dependencyWalker = new DependencyWalker();
let transformer = new Transformer(configuration);

let coverage = new Coverage(configuration);
let bundler = new Bundler(configuration, dependencyWalker, transformer);
let compiler = new Compiler();

let framework = new Framework(bundler, compiler, configuration, coverage, dependencyWalker, transformer);
let preprocessor = new Preprocessor(bundler, compiler, configuration, coverage, sharedProcessedFiles);
let reporter = new Reporter(configuration, sharedProcessedFiles);

module.exports = {
    "framework:karma-typescript": ["factory", framework.create],
    "preprocessor:karma-typescript": ["factory", preprocessor.create],
    "reporter:karma-typescript": ["type", reporter.create]
};
