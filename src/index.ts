import Compiler = require("./compiler");
import Configuration = require("./configuration");

// tslint:disable-next-line:no-var-requires
let Bundler = require("../lib/bundler");
// tslint:disable-next-line:no-var-requires
let Coverage = require("../lib/coverage");
// tslint:disable-next-line:no-var-requires
let Framework = require("../lib/framework");
// tslint:disable-next-line:no-var-requires
let Preprocessor = require("../lib/preprocessor");
// tslint:disable-next-line:no-var-requires
let Reporter = require("../lib/reporter");

let sharedProcessedFiles = {};

let configuration = new Configuration();
let coverage = new Coverage(configuration);

let bundler = new Bundler(configuration, coverage);
let compiler = new Compiler(configuration);

let framework = new Framework(bundler, compiler, configuration, coverage);
let preprocessor = new Preprocessor(bundler, compiler, configuration, coverage, sharedProcessedFiles);
let reporter = new Reporter(configuration, sharedProcessedFiles);

module.exports = {
    "framework:karma-typescript": ["factory", framework.create],
    "preprocessor:karma-typescript": ["factory", preprocessor.create],
    "reporter:karma-typescript": ["type", reporter.create]
};
