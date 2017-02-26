"use strict";
var acorn = require("acorn");
var babel = require("babel-core");
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
var initialize = function (options) {
    options = options || {};
    if (!options.presets || options.presets.length === 0) {
        options.presets = ["es2015"];
    }
    var transform = function (context, callback) {
        if (isEs6(context.ast)) {
            if (!options.filename) {
                options.filename = context.filename;
            }
            context.source = babel.transform(context.source, options).code;
            context.ast = acorn.parse(context.source, { sourceType: "module" });
            return callback(undefined, true);
        }
        else {
            return callback(undefined, false);
        }
    };
    return transform;
};
module.exports = initialize;
