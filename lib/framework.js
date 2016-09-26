var path = require("path");

var createFramework = function(config) {

    var moduleLoaderPattern = path.join(__dirname, "bigload/loader.js");

    config.files.push({ pattern: moduleLoaderPattern, included: true, served: true, watched: false });
    config.preprocessors[moduleLoaderPattern] = ["karma-typescript-bigload-preprocessor"];
};

module.exports = createFramework;
