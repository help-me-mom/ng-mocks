function Preprocessor(bundler, compiler, config, coverage, sharedProcessedFiles) {

    var path = require("path"),
        log;

    function shouldAddLoader() {

        return compiler.getModuleFormat().toLowerCase() === "commonjs" &&
               compiler.getRequiredModulesCount() > 0 &&
               !config.hasPreprocessor("commonjs");
    }

    var create = function(karmaConfig, helper, logger) {

        log = logger.create("preprocessor.karma-typescript");

        config.initialize(karmaConfig, logger);
        coverage.initialize(helper, logger);

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
                            coverage.instrument(file, bundled, emitOutput, function(result) {
                                done(null, result);
                            });
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
