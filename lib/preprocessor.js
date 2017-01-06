function Preprocessor(bundler, compiler, config, sharedProcessedFiles) {

    var coverage = require("karma-coverage/lib/preprocessor"),
        path = require("path"),
        sourcemap = require("./sourcemap"),
        log;

    function hasNoOutput(file, emitOutput) {

        return emitOutput.outputText === sourcemap.getComment(file);
    }

    function instrumentSource(coveragePreprocessor, done, file, bundled, emitOutput) {

        if(config.hasPreprocessor("commonjs")) {

            log.debug("karma-commonjs already configured, done");
            done(null, bundled);
            return;
        }

        if(config.hasPreprocessor("coverage")) {

            log.debug("karma-coverage already configured, done");
            done(null, bundled);
            return;
        }

        if(!config.coverageOptions.instrumentation ||
           config.coverageOptions.exclude.test(file.originalPath) ||
           hasNoOutput(file, emitOutput)) {

            log.debug("Excluding file %s from instrumentation, done", file.originalPath);
            done(null, bundled);
            return;
        }

        coveragePreprocessor(bundled, file, function(instrumentedResult){
            done(null, instrumentedResult);
        });
    }

    function shouldAddLoader() {

        return compiler.getModuleFormat().toLowerCase() === "commonjs" &&
               compiler.getRequiredModulesCount() > 0 &&
               !config.hasPreprocessor("commonjs");
    }

    var create = function(karmaConfig, helper, logger) {

        log = logger.create("preprocessor.karma-typescript");

        config.initialize(karmaConfig, logger);

        var coveragePreprocessor = coverage(
                logger,
                helper,
                karmaConfig.basePath,
                config.reporters,
                config.coverageReporter
            );

        return function(content, file, done) {

            try {

                log.debug("Processing \"%s\".", file.originalPath);

                file.path = config.transformPath(file.originalPath);

                compiler.compile(file, function(emitOutput) {

                    if(emitOutput.isDeclarationFile) {
                        done(null, " ");
                    }
                    else {

                        bundler.bundle(file, content, emitOutput, shouldAddLoader(), function(bundled) {
                            sharedProcessedFiles[path.normalize(file.originalPath)] = bundled;
                            instrumentSource(coveragePreprocessor, done, file, bundled, emitOutput);
                        });
                    }
                });
            }
            catch(e) {
                log.error("%s\n processing %s\n%s", e.message, file.originalPath, e.stack);
                done(e, null);
            }
        };
    };

    this.create = create;
    this.create.$inject = ["config", "helper", "logger"];
}

module.exports = Preprocessor;
