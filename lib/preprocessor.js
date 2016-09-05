var path = require("path");
var commonjs = require("karma-commonjs");
var coverage = require("karma-coverage");
var tsc = require("typescript");

var transpiledFiles = {};

function hasPreprocessor(config, name) {

    for(var preprocessor in config.preprocessors) {

        if(config.preprocessors[preprocessor] && config.preprocessors[preprocessor].indexOf(name) !== -1) {

            return true;
        }
    }

    return config.frameworks.indexOf("requirejs") !== -1;
}

function hasCoverageReporter(config) {
    return config.reporters.indexOf("coverage") !== -1;
}

function getReporterArray(config){

    var reporters;

    if(config.reporters) {

        reporters = config.reporters.slice();

        if(!hasCoverageReporter(config)){

            reporters.push("coverage");
        }
    }
    else {

        reporters = ["coverage"];
    }

    return reporters;
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

    result = transpileOutput.outputText.replace("//# sourceMappingURL=module.js.map", ""); // TODO: Is there an compiler option to disable this?
    result += "\n//# sourceMappingURL=" + datauri + "\n";

    return result;
}

function transpile(file, content){

    var reportDiagnostics = false,
        moduleName = path.relative(process.cwd(), file.originalPath),
        transpileOutput = tsc.transpileModule(
        content, {
            compilerOptions: {
                target: "es5",
                module: "commonjs",
                sourceMap: true
            }
        },
        reportDiagnostics, moduleName
    );

    return createSourcemap(file, content, transpileOutput);
}

var createPreprocessor = function(args, config, helper, logger) {

    var log = logger.create("preprocessor.karma-typescript"),
        reporters = getReporterArray(config);

    log.info("Using Typescript %s", tsc.version);

    return function(content, file, done) {

        var result,
            commonjsPreprocessor = commonjs["preprocessor:commonjs"][1](logger, {}, ""),
            coveragePreprocessor = coverage["preprocessor:coverage"][1](
                logger,
                helper,
                config.basePath,
                reporters,
                config.coverageReporter
            );

        log.debug("Processing \"%s\".", file.originalPath);

        try {

            file.path = transformPath(file.originalPath);
            result = transpile(file, content);
            transpiledFiles[path.normalize(file.originalPath)] = result;

            if(hasPreprocessor(config, "commonjs")) {
                log.debug("karma-commonjs configured, done");
                done(null, result);
            }
            else {
                commonjsPreprocessor(result, file, function(commonjsResult) {

                    if(hasPreprocessor(config, "coverage")) {
                        log.debug("karma-coverage configured, done");
                        done(null, commonjsResult);
                    }
                    else {
                        coveragePreprocessor(commonjsResult, file, function(instrumentedResult){
                            done(null, instrumentedResult);
                        });
                    }
                });
            }
        }
        catch(e) {

            log.error("%s\n processing %s\n%s", e.message, file.originalPath, e.stack);
            return done(e, null);
        }
    };
};

createPreprocessor.$inject = ["args", "config", "helper", "logger"];

module.exports = {
    preprocessor: createPreprocessor,
    transpiledFiles: transpiledFiles
};
