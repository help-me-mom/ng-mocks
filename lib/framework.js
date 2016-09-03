var commonjs = require("karma-commonjs");

function hasCommonJsFramework(config) {
    return config.frameworks.indexOf("commonjs") !== -1;
}

var createFramework = function(config) {

    if(!hasCommonJsFramework(config)){

        commonjs["framework:commonjs"][1](config.files);
    }
};

module.exports = createFramework;
