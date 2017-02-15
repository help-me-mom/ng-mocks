import Bundler = require("./bundler");
import Compiler = require("./compiler");
import Configuration = require("./configuration");
import Coverage = require("./coverage");
import Framework = require("./karma/framework");
import Preprocessor = require("./karma/preprocessor");
import Reporter = require("./karma/reporter");
import SharedProcessedFiles = require("./shared-processed-files");

let sharedProcessedFiles: SharedProcessedFiles = {};

let configuration = new Configuration();

let coverage = new Coverage(configuration);
let bundler = new Bundler(configuration);
let compiler = new Compiler(configuration);

let framework = new Framework(bundler, compiler, configuration, coverage);
let preprocessor = new Preprocessor(bundler, compiler, configuration, coverage, sharedProcessedFiles);
let reporter = new Reporter(configuration, sharedProcessedFiles);

module.exports = {
    "framework:karma-typescript": ["factory", framework.create],
    "preprocessor:karma-typescript": ["factory", preprocessor.create],
    "reporter:karma-typescript": ["type", reporter.create]
};
