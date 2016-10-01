function Framework(nodeModulesLoader) {

    var path = require("path"),
        create = function(config) {

            config.files.unshift({
                pattern: nodeModulesLoader.location,
                included: true,
                served: true,
                watched: false
            });

            config.files.push({
                pattern: path.join(__dirname, "wide-load/commonjs-bootstrap.js"),
                included: true,
                served: true,
                watched: false
            });
        };

    this.create = create;

    this.create.$inject = ["config"];
}

module.exports = Framework;
