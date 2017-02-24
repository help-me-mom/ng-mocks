var acorn = require("acorn"),
    babel = require("babel-core");

function isEs6(ast) {
    if(ast.body) {
        for(var i = 0; i < ast.body.length; i++) {
            switch(ast.body[i].type) {
                case "ExportAllDeclaration":
                case "ExportDefaultDeclaration":
                case "ExportNamedDeclaration":
                case "ImportDeclaration":
                    return true;
            }
        }
    }
    return false;
}

function initialize(options) {

    options = options || { presets: ["es2015"], sourceMap: "inline" };

    return function es6Transform(context, callback) {
        if(isEs6(context.ast)) {
            context.source = babel.transform(context.source, options).code;
            context.ast = acorn.parse(context.source, { sourceType: "module" });
            return callback(undefined, true);
        }
        else {
            return callback(undefined, false);
        }
    };
}

module.exports = initialize;
