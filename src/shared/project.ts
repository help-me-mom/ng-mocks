import * as glob from "glob";
import * as lodash from "lodash";
import * as path from "path";
import * as ts from "typescript";

import { FilePattern } from "karma";
import { Logger } from "log4js";

import PathTool = require("./path-tool");

import { CompilerOptions } from "../api";
import { Configuration } from "./configuration";
import { Extender } from "./extender";

interface ConfigFileJson {
    config?: any;
    error?: ts.Diagnostic;
}

export enum EventType {
    FileSystemChanged,
    FileContentChanged
}

export class Project {

    private karmaFiles: string[] = [];
    private tsconfig: ts.ParsedCommandLine;

    constructor(private config: Configuration, private log: Logger) {}

    public getKarmaFiles(): string[] {
        return this.karmaFiles;
    }

    public getTsconfig(): ts.ParsedCommandLine {
        return this.tsconfig;
    }

    public hasCompatibleModuleKind(): boolean {
        return this.tsconfig.options.module === ts.ModuleKind.CommonJS;
    }

    public getModuleKind(): string {
        return ts.ModuleKind[this.tsconfig.options.module];
    }

    public handleFileEvent(): EventType {

        const oldKarmaFiles = lodash.cloneDeep(this.karmaFiles || []);
        this.expandKarmaFilePatterns();

        if (!lodash.isEqual(oldKarmaFiles, this.karmaFiles)) {

            this.log.debug("File system changed, resolving tsconfig");
            this.resolveTsConfig();
            return EventType.FileSystemChanged;
        }

        return EventType.FileContentChanged;
    }

    private expandKarmaFilePatterns() {

        const files = (this.config.karma.files as FilePattern[]);
        this.karmaFiles.length = 0;

        files.forEach((file) => {

            const g = new glob.Glob(path.normalize(file.pattern), {
                cwd: "/",
                follow: true,
                nodir: true,
                sync: true
            });

            Array.prototype.push.apply(this.karmaFiles, g.found);
        });
    }

    private resolveTsConfig() {
        const configFileName = this.getTsconfigFilename();
        const configFileJson = this.getConfigFileJson(configFileName);
        const existingOptions = this.getExistingOptions();
        this.tsconfig = this.parseConfigFileJson(configFileName, configFileJson, existingOptions);
    }

    private getTsconfigFilename(): string {

        let configFileName = "";

        if (this.config.tsconfig) {

            configFileName = path.join(this.config.karma.basePath, this.config.tsconfig);

            if (!ts.sys.fileExists(configFileName)) {
                this.log.warn("Tsconfig '%s' configured in karmaTypescriptConfig.tsconfig does not exist",
                    configFileName);
                configFileName = "";
            }
        }

        return PathTool.fixWindowsPath(configFileName);
    }

    private getExistingOptions(): CompilerOptions {
        const compilerOptions = lodash.cloneDeep(this.config.compilerOptions);
        this.convertOptions(compilerOptions);
        return compilerOptions;
    }

    private getConfigFileJson(configFileName: string): ConfigFileJson {

        let configFileJson: ConfigFileJson;

        if (ts.sys.fileExists(configFileName)) {

            this.log.debug("Using %s", configFileName);

            if ((ts as any).parseConfigFile) { // v1.6
                configFileJson = (ts as any).readConfigFile(configFileName);
            }
            else if (ts.parseConfigFileTextToJson) { // v1.7+
                const configFileText = ts.sys.readFile(configFileName);
                configFileJson = ts.parseConfigFileTextToJson(configFileName, configFileText);
            }
            else {
                this.log.error("karma-typescript doesn't know how to use Typescript %s :(", ts.version);
                process.exit(1);
            }
        }
        else {
            configFileJson = {
                config: lodash.cloneDeep(this.config.defaultTsconfig)
            };
            this.log.debug("Fallback to default compiler options");
        }

        this.log.debug("Resolved configFileJson:\n", JSON.stringify(configFileJson, null, 3));
        return configFileJson;
    }

    private parseConfigFileJson(configFileName: string,
                                configFileJson: ConfigFileJson,
                                existingOptions: CompilerOptions): ts.ParsedCommandLine {

        let tsconfig: ts.ParsedCommandLine;
        const basePath = this.resolveBasepath(configFileName);

        if (existingOptions && existingOptions.baseUrl === ".") {
            existingOptions.baseUrl = basePath;
        }

        Extender.extend("include", configFileJson.config, this.config);
        Extender.extend("exclude", configFileJson.config, this.config);

        if ((ts as any).parseConfigFile) {
            tsconfig = (ts as any).parseConfigFile(configFileJson.config, ts.sys, basePath);
            tsconfig.options = (ts as any).extend(existingOptions, tsconfig.options);
        }
        else if (ts.parseJsonConfigFileContent) {
            tsconfig = ts.parseJsonConfigFileContent(configFileJson.config, ts.sys,
                basePath, (existingOptions as any), configFileName);
        }

        if (!tsconfig) {
            this.log.error("karma-typescript doesn't know how to use Typescript %s :(", ts.version);
            process.exit(1);
        }

        delete tsconfig.options.outDir;
        delete tsconfig.options.outFile;
        (tsconfig.options as any).suppressOutputPathCheck = true;

        this.assertModuleKind(tsconfig);

        this.log.debug("Resolved tsconfig:\n", JSON.stringify(tsconfig, null, 3));

        return tsconfig;
    }

    private assertModuleKind(tsconfig: ts.ParsedCommandLine): void {

        if (typeof tsconfig.options.module !== "number" &&
            tsconfig.options.target === ts.ScriptTarget.ES5) {
            tsconfig.options.module = ts.ModuleKind.CommonJS;
        }
    }

    private resolveBasepath(configFileName: string): string {

        if (!configFileName) {
            return this.config.karma.basePath;
        }

        const relativePath = path.relative(this.config.karma.basePath, configFileName);
        const absolutePath = path.join(this.config.karma.basePath, relativePath);
        return path.dirname(absolutePath);
    }

    private convertOptions(options: any): void {

        const names = ["jsx", "lib", "module", "moduleResolution", "target"];

        if (options) {
            (ts as any).optionDeclarations.forEach((declaration: any) => {
                if (names.indexOf(declaration.name) !== -1) {
                    this.setOptions(options, declaration);
                }
            });
        }
    }

    private setOptions(options: any, declaration: any) {
        const name = declaration.name;
        if (options[name]) {
            if (Array.isArray(options[name])) {
                options[name].forEach((option: string, index: number) => {
                    const key = option.toLowerCase();
                    options[name][index] = lodash.isMap(declaration.element.type) ?
                        declaration.element.type.get(key) : declaration.type[key];
                });
            }
            else {
                const key = options[name].toLowerCase();
                options[name] = lodash.isMap(declaration.type) ?
                    declaration.type.get(key) : declaration.type[key];
            }
        }
    }
}
