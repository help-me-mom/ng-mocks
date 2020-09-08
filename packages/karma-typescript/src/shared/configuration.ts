import * as lodash from "lodash";
import * as log4js from "log4js";

import { ConfigOptions } from "karma";
import { merge } from "lodash";

import {
    BundlerOptions,
    CoverageOptions,
    Extendable,
    KarmaTypescriptConfig,
    Reports
} from "../api";

export interface LoggerList {
    [key: string]: log4js.Logger;
}

export interface Configuration {
    [key: string]: any;
}

export class Configuration implements KarmaTypescriptConfig {

    public karma: ConfigOptions;
    public bundlerOptions: BundlerOptions;
    public compilerDelay: number;
    public compilerOptions: any;
    public coverageOptions: CoverageOptions;
    public defaultTsconfig: any;
    public exclude: string[] | Extendable;
    public include: string[] | Extendable;
    public logAppenders: { [name: string]: log4js.Appender };
    public reports: Reports;
    public transformPath: (filepath: string) => string;
    public tsconfig: string;
    public stopOnFailure: boolean;

    public hasCoverageThreshold: boolean;

    private asserted: boolean;
    private karmaTypescriptConfig: KarmaTypescriptConfig;
    private callbacks: (() => void)[] = [];

    constructor(private loggers: LoggerList) {}

    public initialize(config: ConfigOptions) : void {

        this.karma = config || {};
        this.karmaTypescriptConfig = (config as any).karmaTypescriptConfig || {};

        this.configureLogging();
        this.configureBundler();
        this.configureCoverage();
        this.configureProject();
        this.configurePreprocessor();
        this.configureReporter();
        this.assertConfiguration();

        for (const callback of this.callbacks) {
            callback();
        }
    }

    public whenReady(callback: () => void) : void {
        this.callbacks.push(callback);
    }

    public hasFramework(name: string): boolean {
        return this.karma.frameworks.indexOf(name) !== -1;
    }

    public hasPreprocessor(name: string): boolean {
        for (const preprocessor in this.karma.preprocessors) {
            if (this.karma.preprocessors[preprocessor] &&
                this.karma.preprocessors[preprocessor].indexOf(name) !== -1) {
                return true;
            }
        }
        return false;
    }

    public hasReporter(name: string): boolean {
        return this.karma.reporters.indexOf(name) !== -1;
    }

    private configureLogging() {
        this.logAppenders = this.karma.loggers instanceof Array
            ? this.karma.loggers.reduce((logAppenders, logger, index) =>
                Object.assign(logAppenders, { [logger.type + index.toString()]: logger }), {})
            : this.karma.loggers;

        if (this.logAppenders != null) {
            log4js.configure({
                appenders: this.logAppenders,
                categories: {
                    default: {
                        appenders: Object.keys(this.logAppenders),
                        level: this.karma.logLevel
                    }
                }
            });
        }

        Object.keys(this.loggers).forEach((key) => {
            this.loggers[key].level = this.karma.logLevel;
        });
    }

    private configureBundler(): void {

        const defaultBundlerOptions: BundlerOptions = {
            acornOptions: {
                ecmaVersion: 10,
                sourceType: "module"
            },
            addNodeGlobals: true,
            constants: {},
            entrypoints: /.*/,
            exclude: [],
            ignore: [],
            noParse: [],
            resolve: {
                alias: {},
                directories: ["node_modules"],
                extensions: [".js", ".json", ".mjs", ".ts", ".tsx"]
            },
            sourceMap: false,
            transforms: [],
            validateSyntax: true
        };

        this.bundlerOptions = merge(defaultBundlerOptions, this.karmaTypescriptConfig.bundlerOptions);
    }

    private configureCoverage() {

        const defaultCoverageOptions: CoverageOptions = {
            exclude: /\.(d|spec|test)\.ts$/i,
            instrumentation: true,
            instrumenterOptions: {},
            threshold: {
                file: {
                    branches: 0,
                    excludes: [],
                    functions: 0,
                    lines: 0,
                    overrides: {},
                    statements: 0
                },
                global: {
                    branches: 0,
                    excludes: [],
                    functions: 0,
                    lines: 0,
                    statements: 0
                }
            }
        };

        this.hasCoverageThreshold = !!this.karmaTypescriptConfig.coverageOptions &&
            !!this.karmaTypescriptConfig.coverageOptions.threshold;
        this.coverageOptions = merge(defaultCoverageOptions, this.karmaTypescriptConfig.coverageOptions);

        this.assertCoverageExclude(this.coverageOptions.exclude);
    }

    private configureProject(): void {

        this.compilerDelay = this.karmaTypescriptConfig.compilerDelay || 250;
        this.compilerOptions = this.karmaTypescriptConfig.compilerOptions;

        this.defaultTsconfig = {
            compilerOptions: {
                emitDecoratorMetadata: true,
                experimentalDecorators: true,
                jsx: "react",
                module: "commonjs",
                sourceMap: true,
                target: "ES5"
            },
            exclude: ["node_modules"]
        };

        this.exclude = this.karmaTypescriptConfig.exclude;
        this.include = this.karmaTypescriptConfig.include;
        this.tsconfig = this.karmaTypescriptConfig.tsconfig;
        this.assertExtendable("exclude");
        this.assertExtendable("include");
        this.stopOnFailure = this.karmaTypescriptConfig.stopOnFailure !== false;
    }

    private configurePreprocessor() {

        const transformPath = (filepath: string) => {
            return filepath.replace(/\.(ts|tsx)$/, ".js");
        };

        this.transformPath = this.karmaTypescriptConfig.transformPath || transformPath;
    }

    private configureReporter() {
        this.reports = this.karmaTypescriptConfig.reports || { html: "coverage" };
    }

    private assertConfiguration() {
        if (!this.asserted) {
            this.asserted = true;
            this.assertFrameworkConfiguration();
            this.assertDeprecatedOptions();
        }
    }

    private assertFrameworkConfiguration() {
        if (this.hasPreprocessor("karma-typescript") &&
          (!this.karma.frameworks || this.karma.frameworks.indexOf("karma-typescript") === -1)) {
            throw new Error("Missing karma-typescript framework, please add" +
                            "'frameworks: [\"karma-typescript\"]' to your Karma config");
        }
    }

    private assertExtendable(key: string) {
        const extendable = (this[key] as Extendable);

        if (extendable === undefined) {
            return;
        }

        if (Array.isArray(extendable)) {
            extendable.forEach((item) => {
                if (!lodash.isString(item)) {
                    throw new Error("Expected a string in 'karmaTypescriptConfig." + key + "', got [" +
                        typeof item + "]: " + item);
                }
            });
            return;
        }

        if (lodash.isObject(extendable)) {
            if (["merge", "replace"].indexOf(extendable.mode) === -1) {
                throw new Error("Expected 'karmaTypescriptConfig." + key + ".mode' to be 'merge|replace', got '" +
                    extendable.mode + "'");
            }
            if (Array.isArray(extendable.values)) {
                extendable.values.forEach((item) => {
                    if (!lodash.isString(item)) {
                        throw new Error("Expected a string in 'karmaTypescriptConfig." + key + ".values', got [" +
                            typeof item + "]: " + item);
                    }
                });
            }
            return;
        }

        throw new Error("The option 'karmaTypescriptConfig." + key +
                        "' must be an array of strings or { mode: \"replace|extend\", values: [string, string], got [" +
                    typeof this.exclude + "]: " + this.exclude);
    }

    private assertDeprecatedOptions() {
        if ((this.bundlerOptions as any).ignoredModuleNames) {
            throw new Error("The option 'karmaTypescriptConfig.bundlerOptions.ignoredModuleNames' has been " +
                            "removed, please use 'karmaTypescriptConfig.bundlerOptions.exclude' instead");
        }

        if ((this.karmaTypescriptConfig as any).excludeFromCoverage !== undefined) {
            throw new Error("The option 'karmaTypescriptConfig.excludeFromCoverage' has been " +
                            "removed, please use 'karmaTypescriptConfig.coverageOptions.exclude' instead");
        }

        if ((this.karmaTypescriptConfig as any).disableCodeCoverageInstrumentation !== undefined) {
            throw new Error("The option 'karmaTypescriptConfig.disableCodeCoverageInstrumentation' has been " +
                            "removed, please use 'karmaTypescriptConfig.coverageOptions.instrumentation' instead");
        }

        if ((this.karmaTypescriptConfig as any).remapOptions !== undefined) {
            throw new Error("The option 'karmaTypescriptConfig.remapOptions' has been " +
                            "removed, please use 'karmaTypescriptConfig.coverageOptions.instrumenterOptions' instead");
        }
    }

    private assertCoverageExclude(regex: any) {
        if (regex instanceof RegExp || !regex) {
            return regex;
        }
        else if (Array.isArray(regex)) {
            regex.forEach((r) => {
                if (!(r instanceof RegExp)) {
                    this.throwCoverageExcludeError(r);
                }
            });
            return regex;
        }

        this.throwCoverageExcludeError(regex);
    }

    private throwCoverageExcludeError(regex: any) {
        throw new Error("karmaTypescriptConfig.coverageOptions.exclude " +
            "must be a single RegExp or an Array of RegExp, got [" + typeof regex + "]: " + regex);
    }
}
