var path = require("path");
var commonjs = require("karma-commonjs");
var coverage = require("karma-coverage");
var tsc = require("typescript");

var log;
var config;
var specFileRegex = new RegExp(/\.(spec|test)\.ts/);
var transpiledFiles = {};

function hasPreprocessor(name) {

    for(var preprocessor in config.preprocessors) {

        if(config.preprocessors[preprocessor] && config.preprocessors[preprocessor].indexOf(name) !== -1) {

            return true;
        }
    }

    return config.frameworks.indexOf("requirejs") !== -1;
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

function transformPath(filepath) {

    return filepath.replace(/\.ts$/, ".js");
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

    result = transpileOutput.outputText.replace("//# sourceMappingURL=module.js.map", ""); // TODO: Is there a compiler option to disable this?
    result += "\n//# sourceMappingURL=" + datauri + "\n";

    return result;
}

function transpile(file, content){

    var transpileOutput = tsc.transpileModule(
            content, {
                compilerOptions: {
                    target: tsc.ScriptTarget.ES5,
                    module: tsc.ModuleKind.CommonJS,
                    sourceMap: true
                }
            }
        );

    return createSourcemap(file, content, transpileOutput);
}

function chainPreprocessors(commonjsPreprocessor, coveragePreprocessor, done, file, result) {

    if(hasPreprocessor("commonjs")) {

        log.debug("karma-commonjs configured, done");
        done(null, result);
    }
    else {

        commonjsPreprocessor(result, file, function(commonjsResult) {

            if(config.karmaTypescriptConfig.disableCodeCoverageInstrumentation || specFileRegex.test(file.originalPath)) {

                log.debug("won't instrument spec file %s, done", file.originalPath);
                done(null, commonjsResult);
            }
            else {

                if(hasPreprocessor("coverage")) {

                    log.debug("karma-coverage configured, done");
                    done(null, commonjsResult);
                }
                else {

                    coveragePreprocessor(commonjsResult, file, function(instrumentedResult){

                        done(null, instrumentedResult);
                    });
                }
            }
        });
    }
}

var createPreprocessor = function(_config, helper, logger) {

    log = logger.create("preprocessor.karma-typescript");
    config = _config;

    log.info("Using Typescript %s", tsc.version);

    return function(content, file, done) {

        var result,
            commonjsPreprocessor = commonjs["preprocessor:commonjs"][1](logger, {}, ""),
            coveragePreprocessor = coverage["preprocessor:coverage"][1](
                logger,
                helper,
                config.basePath,
                getReporterArray(),
                getCoverageReporterConfig()
            );

        log.debug("Processing \"%s\".", file.originalPath);

        try {

            file.path = transformPath(file.originalPath);
            result = transpile(file, content);
            transpiledFiles[path.normalize(file.originalPath)] = result;

            chainPreprocessors(commonjsPreprocessor, coveragePreprocessor, done, file, result);
        }
        catch(e) {

            log.error("%s\n processing %s\n%s", e.message, file.originalPath, e.stack);
            done(e, null);
        }
    };
};

createPreprocessor.$inject = ["config", "helper", "logger"];

module.exports = {
    preprocessor: createPreprocessor,
    transpiledFiles: transpiledFiles
};
