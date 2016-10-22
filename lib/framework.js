function Framework(compiler, nodeModulesLoader) {

    var path = require("path"),
        ts = require("typescript"),
        log,
        defaultTsconfig = {
            compilerOptions: {
                emitDecoratorMetadata: true,
                experimentalDecorators: true,
                jsx: "react",
                module: "commonjs",
                sourceMap: true,
                target: "ES5"
            },
            exclude: ["node_modules"]
        },
        create = function(config, logger) {

            log = logger.create("framework.karma-typescript");

            compiler.compileProject(
                config.basePath,
                resolveTsconfig(getTsconfigFilename(config), getExistingOptions(config)),
                logger.create("compiler.karma-typescript")
            );

            if(!hasCommonJsFramework(config)) {

                config.files.unshift({
                    pattern: nodeModulesLoader.location,
                    included: true,
                    served: true,
                    watched: true
                });

                config.files.push({
                    pattern: path.join(__dirname, "karma-wide-load/commonjs-bootstrap.js"),
                    included: true,
                    served: true,
                    watched: false
                });
            }
        };

    function hasCommonJsFramework(config) {
        return config.frameworks.indexOf("commonjs") !== -1;
    }

    function getTsconfigFilename(config) {

        return config.karmaTypescriptConfig && config.karmaTypescriptConfig.tsconfig ?
            path.join(config.basePath, config.karmaTypescriptConfig.tsconfig) :
            "";
    }

    function getExistingOptions(config) {

        return config.karmaTypescriptConfig ?
            config.karmaTypescriptConfig.compilerOptions :
            {};
    }

    function resolveTsconfig(configFileName, existingOptions) {

        configFileName = configFileName || "";

        var configFileJson = getConfigFileJson(configFileName);

        convertOptions(existingOptions);

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
                config: defaultTsconfig
            };

            log.debug("Fallback to default compiler options: ", configFileJson.config.compilerOptions);
        }

        return configFileJson;
    }

    function parseConfigFileJson(configFileName, configFileJson, existingOptions) {

        var tsconfig;

        if(ts.parseConfigFile) {

            tsconfig = ts.parseConfigFile(configFileJson.config, ts.sys, ts.getDirectoryPath(configFileName));
            tsconfig.options = ts.extend(existingOptions, tsconfig.options);
        }
        else if(ts.parseJsonConfigFileContent) {

            tsconfig = ts.parseJsonConfigFileContent(configFileJson.config, ts.sys, ts.getDirectoryPath(configFileName), existingOptions, configFileName);
        }

        if(!tsconfig) {

            log.error("karma-typescript doesn't know how to use Typescript %s :(", ts.version);
            process.exit(1);
        }

        delete tsconfig.options.outDir;
        delete tsconfig.options.outFile;

        return tsconfig;
    }

    function convertOptions(options) {

        if(options) {

            var optionNameMap = ts.getOptionNameMap().optionNameMap;

            setOption(options, optionNameMap, "module");
            setOption(options, optionNameMap, "target");
            setOption(options, optionNameMap, "jsx");
        }
    }

    function setOption(options, optionNameMap, key) {

        if(options[key] && typeof options[key] === "string") {

            options[key] = optionNameMap[key].type[options[key].toLowerCase()] || 0;
        }
    }

    this.create = create;

    this.create.$inject = ["config", "logger"];
}

module.exports = Framework;
