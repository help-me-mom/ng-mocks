import * as log4js from "log4js";

import { Bundler } from "./bundler/bundler";
import { DependencyWalker } from "./bundler/dependency-walker";
import { Globals } from "./bundler/globals";
import { Resolver } from "./bundler/resolve/resolver";
import { SourceReader } from "./bundler/resolve/source-reader";
import { SourceMap } from "./bundler/source-map";
import { Transformer } from "./bundler/transformer";
import { Validator } from "./bundler/validator";

import { Compiler } from "./compiler/compiler";

import { Coverage } from "./istanbul/coverage";
import { Threshold } from "./istanbul/threshold";

import { Framework } from "./karma/framework";
import { Preprocessor } from "./karma/preprocessor";
import { Reporter } from "./karma/reporter";

import { Configuration, LoggerList } from "./shared/configuration";
import { Project } from "./shared/project";

const loggers: LoggerList = {
    bundler: log4js.getLogger("bundler.karma-typescript"),
    compiler: log4js.getLogger("compiler.karma-typescript"),
    dependencyWalker: log4js.getLogger("dependency-walker.karma-typescript"),
    project: log4js.getLogger("project.karma-typescript"),
    resolver: log4js.getLogger("resolver.karma-typescript"),
    sourceMap: log4js.getLogger("source-map.karma-typescript"),
    sourceReader: log4js.getLogger("source-reader.karma-typescript"),
    threshold: log4js.getLogger("threshold.karma-typescript"),
    transformer: log4js.getLogger("transformer.karma-typescript"),
    validator: log4js.getLogger("validator.karma-typescript")
};

const configuration = new Configuration(loggers);
const project = new Project(configuration, loggers.project);
const dependencyWalker = new DependencyWalker(loggers.dependencyWalker);

const compiler = new Compiler(configuration, loggers.compiler, project);
const coverage = new Coverage(configuration);
const transformer = new Transformer(configuration, loggers.transformer, project);
const threshold = new Threshold(configuration, loggers.threshold);
const validator = new Validator(configuration, loggers.validator);

const sourceReader = new SourceReader(configuration, loggers.sourceReader, transformer);
const resolver = new Resolver(configuration, dependencyWalker, loggers.resolver, sourceReader);
const globals = new Globals(configuration, resolver);
const sourceMap = new SourceMap(configuration, loggers.sourceMap);

const bundler = new Bundler(configuration, dependencyWalker, globals, loggers.bundler,
                          project, resolver, sourceMap, transformer, validator);

const framework = new Framework(bundler, configuration, resolver);
const preprocessor = new Preprocessor(bundler, compiler, configuration, coverage);
const reporter = new Reporter(configuration, threshold);

module.exports = {
    "framework:karma-typescript": ["factory", framework.create],
    "preprocessor:karma-typescript": ["factory", preprocessor.create],
    "reporter:karma-typescript": ["type", reporter.create]
};
