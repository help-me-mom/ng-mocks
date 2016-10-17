function Framework(compiler, nodeModulesLoader) {

    var create = function(config, logger) {

        var path = require("path"),
            existingOptions = config.karmaTypescriptConfig ? config.karmaTypescriptConfig.compilerOptions : {};

        compiler.compileProject(config.basePath, existingOptions, logger.create("compiler.karma-typescript"));

        config.files.unshift({
            pattern: nodeModulesLoader.location,
            included: true,
            served: true,
            watched: true
        });

        config.files.push({
            pattern: path.join(__dirname, "karma-wide-load/commonjs-bootstrap.js"),
            included: true,
            served: true,
            watched: false
        });
    };

    this.create = create;

    this.create.$inject = ["config", "logger"];
}

module.exports = Framework;
