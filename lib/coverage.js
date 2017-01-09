function Coverage(config) {

    var coverage = require("karma-coverage/lib/preprocessor"),
        sourcemap = require("./sourcemap"),
        coveragePreprocessor,
        log;

    function initialize(helper, logger) {

        log = logger.create("coverage.karma-typescript");

        coveragePreprocessor = coverage(
            logger,
            helper,
            config.basePath,
            config.reporters,
            config.coverageReporter
        );
    }

    function instrument(file, bundled, emitOutput, callback) {

        if(config.hasPreprocessor("commonjs")) {
            log.debug("karma-commonjs already configured");
            callback(bundled);
            return;
        }

        if(config.hasPreprocessor("coverage")) {
            log.debug("karma-coverage already configured");
            callback(bundled);
            return;
        }

        if(!config.coverageOptions.instrumentation ||
           config.coverageOptions.exclude.test(file.originalPath) ||
           hasNoOutput(file, emitOutput)) {

            log.debug("Excluding file %s from instrumentation", file.originalPath);
            callback(bundled);
            return;
        }

        coveragePreprocessor(bundled, file, callback);
    }

    function hasNoOutput(file, emitOutput) {

        return emitOutput.outputText === sourcemap.getComment(file);
    }

    this.initialize = initialize;
    this.instrument = instrument;
}

module.exports = Coverage;
