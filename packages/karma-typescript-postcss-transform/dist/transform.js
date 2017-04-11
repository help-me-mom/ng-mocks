"use strict";
var log4js = require("log4js");
var os = require("os");
var postcss = require("postcss");
var log;
var configure = function (plugins, options, filter) {
    options = options || {};
    filter = (filter instanceof RegExp) ? filter : /\.css$/;
    var transform = function (context, callback) {
        options.from = context.filename;
        options.to = context.filename;
        if (context.filename.match(filter)) {
            postcss(plugins)
                .process(context.source, options)
                .then(function (result) {
                result.warnings().forEach(function (warning) {
                    log.warn(warning.toString());
                });
                context.source = result.css;
                callback(undefined, true);
            }, function (error) {
                if (error.name === "CssSyntaxError") {
                    log.warn(error.message + os.EOL + error.showSourceCode());
                    callback(undefined, false);
                }
                else {
                    callback(error, false);
                }
            });
        }
        else {
            return callback(undefined, false);
        }
    };
    var initialize = function (logOptions) {
        log4js.setGlobalLogLevel(logOptions.level);
        log4js.configure({ appenders: logOptions.appenders });
        log = log4js.getLogger("postcss-transform.karma-typescript");
    };
    return Object.assign(transform, { initialize: initialize });
};
module.exports = configure;
