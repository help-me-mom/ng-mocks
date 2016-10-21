function Preprocessor(compiler, nodeModulesLoader, sharedProcessedFiles) {

    var coverage = require("karma-coverage"),
        path = require("path"),

        log,
        config,
        excludedFiles = new RegExp(/\.(d|spec|test)\.ts/);

    function transformPath(filepath) {

        return filepath.replace(/\.(ts|tsx)$/, ".js");
    }

    function hasPreprocessor(name) {

        for(var preprocessor in config.preprocessors) {

            if(config.preprocessors[preprocessor] && config.preprocessors[preprocessor].indexOf(name) !== -1) {

                return true;
            }
        }

        return false;
    }

    function hasCoverageReporter() {

        return config.reporters.indexOf("coverage") !== -1;
    }

    function getReporterArray(){

        var reporters;

        if(config.reporters) {

            reporters = config.reporters.slice();

            if(!hasCoverageReporter()){

                reporters.push("coverage");
            }
        }
        else {

            reporters = ["coverage"];
        }

        return reporters;
    }

    function getCoverageReporterConfig() {

        return config.coverageReporter || {
            instrumenterOptions: {
                istanbul: { noCompact: true }
            }
        };
    }

    function createSourcemap(file, originalSource, emitOutput){

        var result = emitOutput.outputText,
            map,
            datauri;

        if(emitOutput.sourceMapText) {

            map = JSON.parse(emitOutput.sourceMapText);
            map.sources[0] = path.basename(file.originalPath);
            map.sourcesContent = [originalSource];
            map.file = path.basename(file.path);
            file.sourceMap = map;
            datauri = "data:application/json;charset=utf-8;base64," + new Buffer(JSON.stringify(map)).toString("base64");

            result = result.replace("//# sourceMappingURL=" + path.basename(file.path) + ".map", ""); // TODO: Is there a compiler option to disable this?
            result += "\n//# sourceMappingURL=" + datauri + "\n";
        }

        return result;
    }

    function chainPreprocessors(coveragePreprocessor, done, file, result) {

        if(excludedFiles.test(file.originalPath)) {

            log.debug("Excluding file %s from instrumentation, done", file.originalPath);
            done(null, result);
        }
        else {

            if(hasPreprocessor("coverage")) {

                log.debug("Karma-coverage already configured, done");
                done(null, result);
            }
            else {

                coveragePreprocessor(result, file, function(instrumentedResult){

                    done(null, instrumentedResult);
                });
            }
        }
    }

    function compilerUsesCommonJs() {

        return compiler.getModuleFormat().toLowerCase() === "commonjs";
    }

    var create = function(_config, helper, logger) {

        log = logger.create("preprocessor.karma-typescript");
        config = _config;

        var coveragePreprocessor = coverage["preprocessor:coverage"][1](
                logger,
                helper,
                config.basePath,
                getReporterArray(),
                getCoverageReporterConfig()
            );

        return function(originalSource, file, done) {

            var result,
                emitOutput;

            try {

                file.path = transformPath(file.originalPath);

                emitOutput = compiler.compileFile(file.path, file.originalPath);

                result = createSourcemap(file, originalSource, emitOutput);

                if(compilerUsesCommonJs()) {

                    result = nodeModulesLoader.loadModules(file.path, result, emitOutput.imports);
                }

                sharedProcessedFiles[path.normalize(file.originalPath)] = result;

                chainPreprocessors(coveragePreprocessor, done, file, result);
            }
            catch(e) {

                log.error("%s\n processing %s\n%s", e.message, file.originalPath, e.stack);
                done(e, null);
            }

            log.debug("Processing \"%s\".", file.originalPath);
        };
    };

    this.create = create;
    this.create.$inject = ["config", "helper", "logger"];
}

module.exports = Preprocessor;
