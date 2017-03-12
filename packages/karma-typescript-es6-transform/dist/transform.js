"use strict";
var acorn = require("acorn");
var babel = require("babel-core");
var log4js = require("log4js");
var log;
var isEs6 = function (ast) {
    if (ast.body) {
        for (var _i = 0, _a = ast.body; _i < _a.length; _i++) {
            var statement = _a[_i];
            switch (statement.type) {
                case "ExportAllDeclaration":
                case "ExportDefaultDeclaration":
                case "ExportNamedDeclaration":
                case "ImportDeclaration":
                    return true;
                default:
            }
        }
    }
    return false;
};
var configure = function (options) {
    options = options || {};
    if (!options.presets || options.presets.length === 0) {
        options.presets = ["es2015"];
    }
    var transform = function (context, callback) {
        if (!context.js) {
            return callback(undefined, false);
        }
        if (isEs6(context.js.ast)) {
            log.debug("Transforming %s", context.filename);
            if (!options.filename) {
                options.filename = context.filename;
            }
            context.source = babel.transform(context.source, options).code;
            context.js.ast = acorn.parse(context.source, { sourceType: "module" });
            return callback(undefined, true);
        }
        else {
            return callback(undefined, false);
        }
    };
    var initialize = function (logOptions) {
        log4js.setGlobalLogLevel(logOptions.level);
        log4js.configure({ appenders: logOptions.appenders });
        log = log4js.getLogger("es6-transform.karma-typescript");
    };
    return Object.assign(transform, { initialize: initialize });
};
module.exports = configure;
