var path = require("path");
var commonjs = require("karma-commonjs");

function hasCommonJsFramework(config) {
    return config.frameworks.indexOf("commonjs") !== -1;
}

var createFramework = function(config) {

    var styleLoaderPattern = path.join(__dirname, "style/loader.js");

    config.files.push({ pattern: styleLoaderPattern, included: true, served: true, watched: false });
    config.preprocessors[styleLoaderPattern] = ["karma-typescript-style-preprocessor"];

    if(!hasCommonJsFramework(config)){

        commonjs["framework:commonjs"][1](config.files);
    }
};

module.exports = createFramework;
