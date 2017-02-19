import { Bundler } from "./bundler/bundler";
import { DependencyWalker } from "./bundler/dependency-walker";
import { Transformer } from "./bundler/transformer";
import { Compiler } from "./compiler/compiler";
import { Coverage } from "./istanbul/coverage";
import { Framework } from "./karma/framework";
import { Preprocessor } from "./karma/preprocessor";
import { Reporter } from "./karma/reporter";
import { Configuration } from "./shared/configuration";
import { SharedProcessedFiles } from "./shared/shared-processed-files";

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
