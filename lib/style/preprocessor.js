var os = require("os");
var path = require("path");
var glob = require("glob");
var commonjs = require("karma-commonjs");

var createPreprocessor = function(config, logger) {

    var log = logger.create("preprocessor.karma-typescript-style-preprocessor"),
        commonjsPreprocessor = commonjs["preprocessor:commonjs"][1](logger, {}, "");

    return function(content, file, done) {

        log.debug("Processing style loader dummy %s", file.path);

        glob(config.basePath + "/!(node_modules)/**/*.+(css|less|sass|scss)", {}, function (error, files) {

            files.forEach(function(moduleName){

                var moduleFile = { path: moduleName, originalPath: moduleName };

                log.debug("Adding dummy modules for %s", moduleName);

                commonjsPreprocessor("{}", moduleFile, function(commonjsResult) {
                    content += commonjsResult + os.EOL;
                    content += commonjsResult.replace(path.extname(moduleName), "") + os.EOL;
                });
            });

            done(null, content);
        });
    };
};

createPreprocessor.$inject = ["config", "logger"];

module.exports = {
    preprocessor: createPreprocessor
};
