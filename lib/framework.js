function Framework(bundler, compiler, config, coverage) {

    var cloneDeep = require("lodash.clonedeep"),
        union = require("lodash.union"),
        path = require("path"),
        ts = require("typescript"),
        log,
        create = function(karmaConfig, helper, logger) {

            config.initialize(karmaConfig, logger);
            coverage.initialize(helper, logger);

            log = logger.create("framework.karma-typescript");

            bundler.initialize(logger);
            compiler.initialize(resolveTsconfig(), logger);

            if(!config.hasFramework("commonjs")) {
                bundler.attach(karmaConfig.files);
            }

            log.debug("Karma config:\n", JSON.stringify(karmaConfig, null, 3));
        };

    function getTsconfigFilename() {

        var configFileName = "";

        if(config.tsconfig) {

            configFileName = path.join(config.basePath, config.tsconfig);

            if(!ts.sys.fileExists(configFileName)) {
                log.warn("Tsconfig '%s' configured in karmaTypescriptConfig.tsconfig does not exist", configFileName);
                configFileName = "";
            }
        }

        return fixWindowsPath(configFileName);
    }

    function getExistingOptions() {

        convertOptions(config.compilerOptions);
        return config.compilerOptions;
    }

    function resolveTsconfig() {

        var configFileName = getTsconfigFilename(),
            configFileJson = getConfigFileJson(configFileName),
            existingOptions = getExistingOptions();

        return parseConfigFileJson(configFileName, configFileJson, existingOptions);
    }

    function getConfigFileJson(configFileName) {

        var configFileJson,
            configFileText;

        if(ts.sys.fileExists(configFileName)) {

            log.debug("Using %s", configFileName);

            if(ts.parseConfigFile) { // v1.6

                configFileJson = ts.readConfigFile(configFileName);
            }
            else if(ts.parseConfigFileTextToJson) { // v1.7+

                configFileText = ts.sys.readFile(configFileName);
                configFileJson = ts.parseConfigFileTextToJson(configFileName, configFileText);
            }
            else {
                log.error("karma-typescript doesn't know how to use Typescript %s :(", ts.version);
                process.exit(1);
            }
        }
        else {

            configFileJson = {
                config: cloneDeep(config.defaultTsconfig)
            };

            log.debug("Fallback to default compiler options");
        }

        log.debug("Resolved configFileJson:\n", JSON.stringify(configFileJson, null, 3));

        return configFileJson;
    }

    function parseConfigFileJson(configFileName, configFileJson, existingOptions) {

        var tsconfig;

        extend("include", configFileJson.config, config);
        extend("exclude", configFileJson.config, config);

        if(ts.parseConfigFile) {

            tsconfig = ts.parseConfigFile(configFileJson.config, ts.sys, ts.getDirectoryPath(configFileName));
            tsconfig.options = ts.extend(existingOptions, tsconfig.options);
        }
        else if(ts.parseJsonConfigFileContent) {

            tsconfig = ts.parseJsonConfigFileContent(configFileJson.config, ts.sys, path.dirname(configFileName), existingOptions, configFileName);
        }

        if(!tsconfig) {

            log.error("karma-typescript doesn't know how to use Typescript %s :(", ts.version);
            process.exit(1);
        }

        delete tsconfig.options.outDir;
        delete tsconfig.options.outFile;

        log.debug("Resolved tsconfig:\n", JSON.stringify(tsconfig, null, 3));

        return tsconfig;
    }

    function extend(key, a, b) {

        var list = union(a[key], b[key]);

        if(list && list.length) {

            a[key] = list.map(function(item){
                return fixWindowsPath(item);
            });
        }
    }

    function fixWindowsPath(value) {
        return value.replace(/\\/g, "/");
    }

    function convertOptions(options) {

        if(options) {

            var optionNameMap = ts.getOptionNameMap().optionNameMap;

            setOption(options, optionNameMap, "jsx");
            setOption(options, optionNameMap, "lib");
            setOption(options, optionNameMap, "module");
            setOption(options, optionNameMap, "moduleResolution");
            setOption(options, optionNameMap, "target");
        }
    }

    function setOption(options, optionNameMap, key) {

        var entry = optionNameMap[key.toLowerCase()];

        if(options[key] && entry) {

            if(typeof options[key] === "string") {
                options[key] = entry.type[options[key].toLowerCase()] || 0;
            }

            if(Array.isArray(options[key])) {
                options[key].forEach(function(option, index) {
                    options[key][index] = entry.element.type[option.toLowerCase()];
                });
            }
        }
    }

    this.create = create;
    this.create.$inject = ["config", "helper", "logger"];
}

module.exports = Framework;
