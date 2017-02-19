"use strict";
var lodash = require("lodash");
var path = require("path");
var ts = require("typescript");
var PathTool = require("../shared/path-tool");
var Framework = (function () {
    function Framework(bundler, compiler, config, coverage, dependencyWalker, transformer) {
        var _this = this;
        this.config = config;
        this.create = function (karmaConfig, helper, logger) {
            config.initialize(karmaConfig, logger);
            coverage.initialize(helper, logger);
            _this.log = logger.create("framework.karma-typescript");
            var tsconfig = _this.resolveTsconfig(config.karma.basePath);
            bundler.initialize(logger);
            compiler.initialize(logger, tsconfig);
            dependencyWalker.initialize(logger);
            transformer.initialize(logger, tsconfig);
            if (!config.hasFramework("commonjs")) {
                bundler.attach(karmaConfig.files);
            }
            _this.log.debug("Karma config:\n", JSON.stringify(karmaConfig, null, 3));
        };
        this.create.$inject = ["config", "helper", "logger"];
    }
    Framework.prototype.getTsconfigFilename = function () {
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
    Framework.prototype.getExistingOptions = function () {
        this.convertOptions(this.config.compilerOptions);
        return this.config.compilerOptions;
    };
    Framework.prototype.resolveTsconfig = function (basePath) {
        var configFileName = this.getTsconfigFilename();
        var configFileJson = this.getConfigFileJson(configFileName);
        var existingOptions = this.getExistingOptions();
        return this.parseConfigFileJson(basePath, configFileName, configFileJson, existingOptions);
    };
    Framework.prototype.getConfigFileJson = function (configFileName) {
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
    Framework.prototype.parseConfigFileJson = function (basePath, configFileName, configFileJson, existingOptions) {
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
    Framework.prototype.extend = function (key, a, b) {
        var list = lodash.union(a[key], b[key]);
        if (list && list.length) {
            a[key] = list.map(function (item) {
                return PathTool.fixWindowsPath(item);
            });
        }
    };
    Framework.prototype.convertOptions = function (options) {
        if (options) {
            var optionNameMap = ts.getOptionNameMap().optionNameMap;
            this.setOption(options, optionNameMap, "jsx");
            this.setOption(options, optionNameMap, "lib");
            this.setOption(options, optionNameMap, "module");
            this.setOption(options, optionNameMap, "moduleResolution");
            this.setOption(options, optionNameMap, "target");
        }
    };
    Framework.prototype.setOption = function (options, optionNameMap, key) {
        var entry = optionNameMap[key.toLowerCase()];
        if (options[key] && entry) {
            if (typeof options[key] === "string") {
                options[key] = entry.type[options[key].toLowerCase()] || 0;
            }
            if (Array.isArray(options[key])) {
                options[key].forEach(function (option, index) {
                    options[key][index] = entry.element.type[option.toLowerCase()];
                });
            }
        }
    };
    return Framework;
}());
exports.Framework = Framework;
