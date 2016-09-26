var os = require("os");
var modules = require("../preprocessor").modules;

var createPreprocessor = function(logger) {

    var log = logger.create("preprocessor.karma-typescript-bigload-preprocessor");

    return function(content, file, done) {

        try {

            for(var name in modules){

                content = modules[name] + os.EOL + content;
            }

            done(null, content);
        }
        catch(e) {

            log.error("%s\n processing %s\n%s", e.message, file.originalPath, e.stack);
            done(e, null);
        }
    };
};

createPreprocessor.$inject = ["logger"];

module.exports = {
    preprocessor: createPreprocessor
};
