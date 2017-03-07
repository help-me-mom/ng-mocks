import { ConfigOptions } from "karma";
import { merge } from "lodash";
import { Logger } from "log4js";

import {
    BundlerOptions,
    CompilerOptions,
    CoverageOptions,
    KarmaTypescriptConfig,
    RemapOptions,
    Reports
} from "../api";

export class Configuration {

    public karma: ConfigOptions;
    public bundlerOptions: BundlerOptions;
    public compilerOptions: CompilerOptions;
    public coverageOptions: CoverageOptions;
    public coverageReporter: any;
    public defaultTsconfig: any;
    public exclude: string[];
    public include: string[];
    public remapOptions: RemapOptions;
    public reporters: string[];
    public reports: Reports;
    public transformPath: Function;
    public tsconfig: string;

    public hasCoverageThreshold: boolean;

    private asserted: boolean;
    private karmaTypescriptConfig: KarmaTypescriptConfig;

    constructor(private log: Logger) { }

    public initialize(config: ConfigOptions) {

        this.karma = config || {};
        this.karmaTypescriptConfig = (<any> config).karmaTypescriptConfig || {};

        this.configureBundler();
        this.configureCoverage();
        this.configureFramework();
        this.configurePreprocessor();
        this.configureReporter();
        this.configureKarmaCoverage();
        this.assertConfiguration();

        this.log.debug(this.toString());
    }

    public hasFramework(name: string): boolean {
        return this.karma.frameworks.indexOf(name) !== -1;
    }

    public hasPreprocessor(name: string): boolean {
        for (let preprocessor in this.karma.preprocessors) {
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

    private configureBundler(): void {

        let defaultBundlerOptions: BundlerOptions = {
            acornOptions: {
                ecmaVersion: 6,
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
                extensions: [".js", ".json", ".ts", ".tsx"]

            },
            transforms: [],
            validateSyntax: true
        };

        this.bundlerOptions = merge(defaultBundlerOptions, this.karmaTypescriptConfig.bundlerOptions);
    }

    private configureCoverage() {

        let defaultCoverageOptions: CoverageOptions = {
            exclude: /\.(d|spec|test)\.ts$/i,
            instrumentation: true,
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

    private configureFramework(): void {

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
    }

    private configurePreprocessor() {

        let transformPath = (filepath: string) => {
            return filepath.replace(/\.(ts|tsx)$/, ".js");
        };

        this.transformPath = this.karmaTypescriptConfig.transformPath || transformPath;
    }

    private configureReporter() {
        this.reports = this.karmaTypescriptConfig.reports || { html: "coverage" };
        this.remapOptions = this.karmaTypescriptConfig.remapOptions || {};
    }

    private configureKarmaCoverage() {

        let defaultCoverageReporter = {
            instrumenterOptions: {
                istanbul: { noCompact: true }
            }
        };

        this.coverageReporter = merge(defaultCoverageReporter, (<any> this.karma).coverageReporter);

        if (Array.isArray(this.karma.reporters)) {
            this.reporters = this.karma.reporters.slice();
            if (this.karma.reporters.indexOf("coverage") === -1){
                this.reporters.push("coverage");
            }
        }
        else {
            this.reporters = ["coverage"];
        }
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

    private assertDeprecatedOptions() {
        if ((<any> this.bundlerOptions).ignoredModuleNames) {
            throw new Error("The option 'karmaTypescriptConfig.bundlerOptions.ignoredModuleNames' has been " +
                            "removed, please use 'karmaTypescriptConfig.bundlerOptions.exclude' instead");
        }

        if ((<any> this.karmaTypescriptConfig).excludeFromCoverage !== undefined) {
            throw new Error("The option 'karmaTypescriptConfig.excludeFromCoverage' has been " +
                            "removed, please use 'karmaTypescriptConfig.coverageOptions.exclude' instead");
        }

        if ((<any> this.karmaTypescriptConfig).disableCodeCoverageInstrumentation !== undefined) {
            throw new Error("The option 'karmaTypescriptConfig.disableCodeCoverageInstrumentation' has been " +
                            "removed, please use 'karmaTypescriptConfig.coverageOptions.instrumentation' instead");
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
