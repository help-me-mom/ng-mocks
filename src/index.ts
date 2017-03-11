import * as log4js from "log4js";

import { Bundler } from "./bundler/bundler";
import { DependencyWalker } from "./bundler/dependency-walker";
import { Globals } from "./bundler/globals";
import { Resolver } from "./bundler/resolver";
import { Transformer } from "./bundler/transformer";
import { Validator } from "./bundler/validator";

import { Compiler } from "./compiler/compiler";
import { Project } from "./compiler/project";

import { Coverage } from "./istanbul/coverage";
import { Threshold } from "./istanbul/threshold";

import { Framework } from "./karma/framework";
import { Preprocessor } from "./karma/preprocessor";
import { Reporter } from "./karma/reporter";

import { Configuration } from "./shared/configuration";
import { SharedProcessedFiles } from "./shared/shared-processed-files";

let sharedProcessedFiles: SharedProcessedFiles = {};

let configuration = new Configuration(log4js.getLogger("configuration.karma-typescript"));
let dependencyWalker = new DependencyWalker(log4js.getLogger("dependency-walker.karma-typescript"));
let transformer = new Transformer(configuration, log4js.getLogger("transformer.karma-typescript"));
let validator = new Validator(configuration);

let resolver = new Resolver(configuration,
                            dependencyWalker,
                            log4js.getLogger("resolver.karma-typescript"),
                            transformer);

let globals = new Globals(configuration, resolver);

let coverage = new Coverage(configuration);

let bundler = new Bundler(configuration,
                          dependencyWalker,
                          globals,
                          log4js.getLogger("bundler.karma-typescript"),
                          resolver,
                          transformer,
                          validator);

let compiler = new Compiler(log4js.getLogger("compiler.karma-typescript"));
let project = new Project(configuration, log4js.getLogger("project.karma-typescript"));
let threshold = new Threshold(configuration, log4js.getLogger("threshold.karma-typescript"));

let framework = new Framework(bundler, compiler, configuration, coverage, project, resolver, transformer);
let preprocessor = new Preprocessor(bundler, compiler, configuration, coverage, sharedProcessedFiles);
let reporter = new Reporter(configuration, sharedProcessedFiles, threshold);

module.exports = {
    "framework:karma-typescript": ["factory", framework.create],
    "preprocessor:karma-typescript": ["factory", preprocessor.create],
    "reporter:karma-typescript": ["type", reporter.create]
};
