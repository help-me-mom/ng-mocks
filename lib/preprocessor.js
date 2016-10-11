function Preprocessor(compiler, nodeModulesLoader, transpiledFiles, transformPathFn) {

    var coverage = require("karma-coverage"),
        path = require("path"),
        tsc = require("typescript"),

        log,
        config,
        processCounter = {},
        specFileRegex = new RegExp(/\.(spec|test)\.ts/);

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

    function createSourcemap(file, content, transpileOutput){

        var result = transpileOutput.outputText,
            map,
            datauri;

        map = JSON.parse(transpileOutput.sourceMapText);
        map.sources[0] = path.basename(file.originalPath);
        map.sourcesContent = [content];
        map.file = path.basename(file.path);
        file.sourceMap = map;
        datauri = "data:application/json;charset=utf-8;base64," + new Buffer(JSON.stringify(map)).toString("base64");

        result = result.replace("//# sourceMappingURL=" + path.basename(file.path) + ".map", ""); // TODO: Is there a compiler option to disable this?
        result += "\n//# sourceMappingURL=" + datauri + "\n";

        return result;
    }

    function chainPreprocessors(coveragePreprocessor, done, file, result) {

        if(specFileRegex.test(file.originalPath)) {

            log.debug("won't instrument spec file %s, done", file.originalPath);
            done(null, result);
        }
        else {

            if(hasPreprocessor("coverage")) {

                log.debug("karma-coverage configured, done");
                done(null, result);
            }
            else {

                coveragePreprocessor(result, file, function(instrumentedResult){

                    done(null, instrumentedResult);
                });
            }
        }
    }

    var create = function(_config, helper, logger) {

        log = logger.create("preprocessor.karma-typescript");
        config = _config;

        log.info("Using Typescript %s", tsc.version);

        var coveragePreprocessor = coverage["preprocessor:coverage"][1](
                logger,
                helper,
                config.basePath,
                getReporterArray(),
                getCoverageReporterConfig()
            );

        return function(content, file, done) {

            var result,
                emitOutput;

            try {

                file.path = transformPathFn(file.originalPath);

                emitOutput = compiler.compileFile(file.path, file.originalPath);

                result = createSourcemap(file, content, emitOutput);

                log.info("loading modules from node_modules (still slow on first run for angular and react)");
                result = nodeModulesLoader.loadModules(file.path, result);

                transpiledFiles[path.normalize(file.originalPath)] = result;

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
