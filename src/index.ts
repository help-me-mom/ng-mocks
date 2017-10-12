import * as log4js from "log4js";

import { Bundler } from "./bundler/bundler";
import { DependencyWalker } from "./bundler/dependency-walker";
import { Globals } from "./bundler/globals";
import { Resolver } from "./bundler/resolve/resolver";
import { SourceReader } from "./bundler/resolve/source-reader";
import { SourceMap } from "./bundler/source-map";
import { Transformer } from "./bundler/transformer";
import { Validator } from "./bundler/validator";

import { Compiler } from "./compiler/compiler";

import { Coverage } from "./istanbul/coverage";
import { Threshold } from "./istanbul/threshold";

import { Framework } from "./karma/framework";
import { Preprocessor } from "./karma/preprocessor";
import { Reporter } from "./karma/reporter";

import { Configuration, LoggerList } from "./shared/configuration";
import { Project } from "./shared/project";
import { SharedProcessedFiles } from "./shared/shared-processed-files";

let loggers: LoggerList = {
    bundler: log4js.getLogger("bundler.karma-typescript"),
    compiler: log4js.getLogger("compiler.karma-typescript"),
    dependencyWalker: log4js.getLogger("dependency-walker.karma-typescript"),
    project: log4js.getLogger("project.karma-typescript"),
    resolver: log4js.getLogger("resolver.karma-typescript"),
    sourceMap: log4js.getLogger("source-map.karma-typescript"),
    sourceReader: log4js.getLogger("source-reader.karma-typescript"),
    threshold: log4js.getLogger("threshold.karma-typescript")
};

let sharedProcessedFiles: SharedProcessedFiles = {};

let configuration = new Configuration(loggers);
let project = new Project(configuration, loggers.project);
let dependencyWalker = new DependencyWalker(loggers.dependencyWalker);

let compiler = new Compiler(configuration, loggers.compiler, project);
let coverage = new Coverage(configuration);
let transformer = new Transformer(configuration, project);
let threshold = new Threshold(configuration, loggers.threshold);
let validator = new Validator(configuration);

let sourceReader = new SourceReader(configuration, loggers.sourceReader, transformer);
let resolver = new Resolver(configuration, dependencyWalker, loggers.resolver, sourceReader);
let globals = new Globals(configuration, resolver);
let sourceMap = new SourceMap(configuration, loggers.sourceMap);

let bundler = new Bundler(configuration, dependencyWalker, globals, loggers.bundler,
                          project, resolver, sourceMap, transformer, validator);

let framework = new Framework(bundler, configuration, resolver);
let preprocessor = new Preprocessor(bundler, compiler, configuration, coverage, sharedProcessedFiles);
let reporter = new Reporter(configuration, sharedProcessedFiles, threshold);

module.exports = {
    "framework:karma-typescript": ["factory", framework.create],
    "preprocessor:karma-typescript": ["factory", preprocessor.create],
    "reporter:karma-typescript": ["type", reporter.create]
};
