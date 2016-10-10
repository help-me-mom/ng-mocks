function Framework(compiler, nodeModulesLoader, project) {

    var path = require("path"),
        create = function(config, logger) {

            var context = project.resolve(config, logger.create("project.karma-typescript"));
            compiler.compileProject(context, logger.create("compiler.karma-typescript"));

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
