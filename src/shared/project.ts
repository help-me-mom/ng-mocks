import * as glob from "glob";
import * as lodash from "lodash";
import * as path from "path";
import * as ts from "typescript";

import { FilePattern } from "karma";
import { Logger } from "log4js";

import PathTool = require("./path-tool");

import { CompilerOptions } from "../api";
import { Configuration } from "./configuration";

type ConfigFileJson = {
    config?: any;
    error?: ts.Diagnostic;
};

// Typescript 2.1.6 and older
type OptionNameMapTs1x = {
    name: string;
    type: { [key: string]: number; };
    element: {
        type: { [key: string]: string; }
    };
};

// Typescript 2.2 and newer
type OptionNameMapTs2x = {
    name: string;
    type: string | Map<string, number>;
    element: {
        type: Map<string, string>
    };
};

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

    public getModuleFormat(): string {
        return ts.ModuleKind[this.tsconfig.options.module] || "unknown";
    }

    public handleFileEvent(): EventType {

        let oldKarmaFiles = lodash.cloneDeep(this.karmaFiles || []);
        this.expandKarmaFilePatterns();

        if (!lodash.isEqual(oldKarmaFiles, this.karmaFiles)) {

            this.log.debug("File system changed, resolving tsconfig");
            this.resolveTsConfig();
            return EventType.FileSystemChanged;
        }

        return EventType.FileContentChanged;
    }

    private expandKarmaFilePatterns() {

        let files = (<FilePattern[]> this.config.karma.files);
        this.karmaFiles.length = 0;

        files.forEach((file) => {

            let g = new glob.Glob(path.normalize(file.pattern), {
                cwd: "/",
                follow: true,
                nodir: true,
                sync: true
            });

            Array.prototype.push.apply(this.karmaFiles, g.found);
        });
    }

    private resolveTsConfig() {
        let configFileName = this.getTsconfigFilename();
        let configFileJson = this.getConfigFileJson(configFileName);
        let existingOptions = this.getExistingOptions();
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
        let compilerOptions = lodash.cloneDeep(this.config.compilerOptions);
        this.convertOptions(compilerOptions);
        return compilerOptions;
    }

    private getConfigFileJson(configFileName: string): ConfigFileJson {

        let configFileJson: ConfigFileJson;

        if (ts.sys.fileExists(configFileName)) {

            this.log.debug("Using %s", configFileName);

            if ((<any> ts).parseConfigFile) { // v1.6
                configFileJson = (<any> ts).readConfigFile(configFileName);
            }
            else if (ts.parseConfigFileTextToJson) { // v1.7+
                let configFileText = ts.sys.readFile(configFileName);
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

        this.extend("include", configFileJson.config, this.config);
        this.extend("exclude", configFileJson.config, this.config);

        if ((<any> ts).parseConfigFile) {
            tsconfig = (<any> ts).parseConfigFile(configFileJson.config, ts.sys, this.config.karma.basePath);
            tsconfig.options = (<any> ts).extend(existingOptions, tsconfig.options);
        }
        else if (ts.parseJsonConfigFileContent) {
            tsconfig = ts.parseJsonConfigFileContent(configFileJson.config, ts.sys,
                this.config.karma.basePath, (<any> existingOptions), configFileName);
        }

        if (!tsconfig) {
            this.log.error("karma-typescript doesn't know how to use Typescript %s :(", ts.version);
            process.exit(1);
        }

        delete tsconfig.options.outDir;
        delete tsconfig.options.outFile;
        (<any> tsconfig.options).suppressOutputPathCheck = true;

        this.log.debug("Resolved tsconfig:\n", JSON.stringify(tsconfig, null, 3));

        return tsconfig;
    }

    private extend(key: string, a: any, b: any): void {

        let list = lodash.union(a[key], b[key]);

        if (list && list.length) {
            a[key] = list.map((item: string) => {
                return PathTool.fixWindowsPath(item);
            });
        }
    }

    private convertOptions(options: CompilerOptions): void {

        if (options) {

            let optionNameMap = (<any> ts).getOptionNameMap().optionNameMap;

            this.setOption(options, optionNameMap, "jsx");
            this.setOption(options, optionNameMap, "lib");
            this.setOption(options, optionNameMap, "module");
            this.setOption(options, optionNameMap, "moduleResolution");
            this.setOption(options, optionNameMap, "target");
        }
    }

    private setOption(options: CompilerOptions, optionNameMap: any, key: string): void {

        if (lodash.isMap(optionNameMap)) {
            let entry = (<OptionNameMapTs2x> optionNameMap.get(key.toLowerCase()));

            if (options[key] && entry) {

                if (typeof options[key] === "string" && lodash.isMap(entry.type)) {
                    options[key] = entry.type.get(options[key].toLowerCase()) || 0;
                }

                if (Array.isArray(options[key]) && lodash.isString(entry.type)) {
                    options[key].forEach((option: string, index: number) => {
                        options[key][index] = entry.element.type.get(option.toLowerCase());
                    });
                }
            }
        }
        else {
            let entry = (<OptionNameMapTs1x> optionNameMap[key.toLowerCase()]);

            if (options[key] && entry) {

                if (typeof options[key] === "string") {
                    options[key] = entry.type[options[key].toLowerCase()] || 0;
                }

                if (Array.isArray(options[key])) {
                    options[key].forEach((option: string, index: number) => {
                        options[key][index] = entry.element.type[option.toLowerCase()];
                    });
                }
            }
        }
    }

}
