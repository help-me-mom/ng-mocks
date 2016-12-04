function JsonPreprocessor(bundler) {

    var log,
        create = function(logger) {

            log = logger.create("preprocessor.karma-typescript");

            return function(json, file, done) {

                log.debug("Processing %s", file.originalPath);

                done(null, bundler.addLoaderFunction({
                    filename: file.originalPath,
                    source: json,
                    requiredModules: []
                }));
            };
        };

    this.create = create;
    this.create.$inject = ["logger"];
}

module.exports = JsonPreprocessor;
