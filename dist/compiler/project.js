"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lodash = require("lodash");
var path = require("path");
var ts = require("typescript");
var PathTool = require("../shared/path-tool");
var Project = (function () {
    function Project(config) {
        this.config = config;
    }
    Project.prototype.initialize = function (logger) {
        this.log = logger.create("project.karma-typescript");
    };
    Project.prototype.resolveTsconfig = function (basePath) {
        var configFileName = this.getTsconfigFilename();
        var configFileJson = this.getConfigFileJson(configFileName);
        var existingOptions = this.getExistingOptions();
        return this.parseConfigFileJson(basePath, configFileName, configFileJson, existingOptions);
    };
    Project.prototype.getTsconfigFilename = function () {
        var configFileName = "";
        if (this.config.tsconfig) {
            configFileName = path.join(this.config.karma.basePath, this.config.tsconfig);
            if (!ts.sys.fileExists(configFileName)) {
                this.log.warn("Tsconfig '%s' configured in karmaTypescriptConfig.tsconfig does not exist", configFileName);
                configFileName = "";
            }
        }
        return PathTool.fixWindowsPath(configFileName);
    };
    Project.prototype.getExistingOptions = function () {
        this.convertOptions(this.config.compilerOptions);
        return this.config.compilerOptions;
    };
    Project.prototype.getConfigFileJson = function (configFileName) {
        var configFileJson;
        if (ts.sys.fileExists(configFileName)) {
            this.log.debug("Using %s", configFileName);
            if (ts.parseConfigFile) {
                configFileJson = ts.readConfigFile(configFileName);
            }
            else if (ts.parseConfigFileTextToJson) {
                var configFileText = ts.sys.readFile(configFileName);
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
    };
    Project.prototype.parseConfigFileJson = function (basePath, configFileName, configFileJson, existingOptions) {
        var tsconfig;
        this.extend("include", configFileJson.config, this.config);
        this.extend("exclude", configFileJson.config, this.config);
        if (ts.parseConfigFile) {
            tsconfig = ts.parseConfigFile(configFileJson.config, ts.sys, basePath);
            tsconfig.options = ts.extend(existingOptions, tsconfig.options);
        }
        else if (ts.parseJsonConfigFileContent) {
            tsconfig = ts.parseJsonConfigFileContent(configFileJson.config, ts.sys, basePath, existingOptions, configFileName);
        }
        if (!tsconfig) {
            this.log.error("karma-typescript doesn't know how to use Typescript %s :(", ts.version);
            process.exit(1);
        }
        delete tsconfig.options.outDir;
        delete tsconfig.options.outFile;
        tsconfig.options.suppressOutputPathCheck = true;
        this.log.debug("Resolved tsconfig:\n", JSON.stringify(tsconfig, null, 3));
        return tsconfig;
    };
    Project.prototype.extend = function (key, a, b) {
        var list = lodash.union(a[key], b[key]);
        if (list && list.length) {
            a[key] = list.map(function (item) {
                return PathTool.fixWindowsPath(item);
            });
        }
    };
    Project.prototype.convertOptions = function (options) {
        if (options) {
            var optionNameMap = ts.getOptionNameMap().optionNameMap;
            this.setOption(options, optionNameMap, "jsx");
            this.setOption(options, optionNameMap, "lib");
            this.setOption(options, optionNameMap, "module");
            this.setOption(options, optionNameMap, "moduleResolution");
            this.setOption(options, optionNameMap, "target");
        }
    };
    Project.prototype.setOption = function (options, optionNameMap, key) {
        if (lodash.isMap(optionNameMap)) {
            var entry_1 = optionNameMap.get(key.toLowerCase());
            if (options[key] && entry_1) {
                if (typeof options[key] === "string" && lodash.isMap(entry_1.type)) {
                    options[key] = entry_1.type.get(options[key].toLowerCase()) || 0;
                }
                if (Array.isArray(options[key]) && lodash.isString(entry_1.type)) {
                    options[key].forEach(function (option, index) {
                        options[key][index] = entry_1.element.type.get(option.toLowerCase());
                    });
                }
            }
        }
        else {
            var entry_2 = optionNameMap[key.toLowerCase()];
            if (options[key] && entry_2) {
                if (typeof options[key] === "string") {
                    options[key] = entry_2.type[options[key].toLowerCase()] || 0;
                }
                if (Array.isArray(options[key])) {
                    options[key].forEach(function (option, index) {
                        options[key][index] = entry_2.element.type[option.toLowerCase()];
                    });
                }
            }
        }
    };
    return Project;
}());
exports.Project = Project;
