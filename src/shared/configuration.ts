import { ConfigOptions } from "karma";
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

    private asserted: boolean;
    private karmaTypescriptConfig: KarmaTypescriptConfig;
    private log: Logger;

    public initialize(config: ConfigOptions, logger: any) {

        this.log = logger.create("configuration.karma-typescript");
        this.karma = this.defaultTo(config, {});
        this.karmaTypescriptConfig = this.defaultTo((<any> config).karmaTypescriptConfig, {});

        this.configureBundler();
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

        this.bundlerOptions = this.defaultTo(this.karmaTypescriptConfig.bundlerOptions, {});
        this.bundlerOptions.addNodeGlobals = this.defaultTo(this.bundlerOptions.addNodeGlobals, true);
        this.bundlerOptions.entrypoints = this.defaultTo(this.bundlerOptions.entrypoints, /.*/);
        this.bundlerOptions.exclude = this.defaultTo(this.bundlerOptions.exclude, []);
        this.bundlerOptions.ignore = this.defaultTo(this.bundlerOptions.ignore, []);
        this.bundlerOptions.noParse = this.defaultTo(this.bundlerOptions.noParse, []);
        this.bundlerOptions.resolve = this.defaultTo(this.bundlerOptions.resolve, {});
        this.bundlerOptions.resolve.alias = this.defaultTo(this.bundlerOptions.resolve.alias, {});
        this.bundlerOptions.resolve.extensions =
            this.defaultTo(this.bundlerOptions.resolve.extensions, [".js", ".json", ".ts", ".tsx"]);
        this.bundlerOptions.resolve.directories =
            this.defaultTo(this.bundlerOptions.resolve.directories, ["node_modules"]);
        this.bundlerOptions.transforms = this.defaultTo(this.bundlerOptions.transforms, []);
        this.bundlerOptions.validateSyntax = this.defaultTo(this.bundlerOptions.validateSyntax, true);
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

        this.coverageOptions = this.defaultTo(this.karmaTypescriptConfig.coverageOptions, {});
        this.coverageOptions.instrumentation = this.defaultTo(this.coverageOptions.instrumentation, true);
        this.coverageOptions.exclude = this.defaultTo(
            this.assertCoverageExclude(this.coverageOptions.exclude), /\.(d|spec|test)\.ts$/i
        );
        this.transformPath = this.defaultTo(this.karmaTypescriptConfig.transformPath, (filepath: string) => {
            return filepath.replace(/\.(ts|tsx)$/, ".js");
        });
    }

    private configureReporter() {

        this.reports = this.defaultTo(this.karmaTypescriptConfig.reports, { html: "coverage" });
        this.remapOptions = this.defaultTo(this.karmaTypescriptConfig.remapOptions, {});
    }

    private configureKarmaCoverage() {

        this.coverageReporter = this.defaultTo((<any> this.karma).coverageReporter, {
            instrumenterOptions: {
                istanbul: { noCompact: true }
            }
        });

        if (this.karma.reporters) {
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
            this.log.warn("The option 'karmaTypescriptConfig.bundlerOptions.ignoredModuleNames' " +
                          "has been deprecated and will be removed in future versions, please " +
                          "use 'karmaTypescriptConfig.bundlerOptions.exclude' instead");
            this.bundlerOptions.exclude = (<any> this.bundlerOptions).ignoredModuleNames;
        }

        if ((<any> this.karmaTypescriptConfig).excludeFromCoverage !== undefined) {
            this.log.warn("The option 'karmaTypescriptConfig.excludeFromCoverage' " +
                          "has been deprecated and will be removed in future versions, please " +
                          "use 'karmaTypescriptConfig.coverageOptions.exclude' instead");
            this.coverageOptions.exclude = (<any> this.karmaTypescriptConfig).excludeFromCoverage;
        }

        if ((<any> this.karmaTypescriptConfig).disableCodeCoverageInstrumentation !== undefined) {
            this.log.warn("The option 'karmaTypescriptConfig.disableCodeCoverageInstrumentation' " +
                          "has been deprecated and will be removed in future versions, please " +
                          "use 'karmaTypescriptConfig.coverageOptions.instrumentation' instead");
            this.coverageOptions.instrumentation =
                !(<any> this.karmaTypescriptConfig).disableCodeCoverageInstrumentation;
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

    private defaultTo<T>(...values: T[]) {
        for (let value of values) {
            if (value !== undefined) {
                return value;
            }
        }
    }
}
