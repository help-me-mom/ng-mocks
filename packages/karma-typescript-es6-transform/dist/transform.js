"use strict";
var acorn = require("acorn");
var babel = require("babel-core");
var log4js = require("log4js");
var log;
var walk;
var isEs6 = function (ast) {
    var es6NodeFound = false;
    if (ast.body) {
        var visitNode = function (node, state, c) {
            if (!es6NodeFound) {
                walk.base[node.type](node, state, c);
                switch (node.type) {
                    case "ClassDeclaration":
                    case "ExportAllDeclaration":
                    case "ExportDefaultDeclaration":
                    case "ExportNamedDeclaration":
                    case "ImportDeclaration":
                        es6NodeFound = true;
                        break;
                    case "VariableDeclaration":
                        var variableDeclaration = node;
                        if (variableDeclaration.kind === "const" || variableDeclaration.kind === "let") {
                            es6NodeFound = true;
                            break;
                        }
                    default:
                }
            }
        };
        walk.recursive(ast, null, {
            Expression: visitNode,
            Statement: visitNode
        });
    }
    return es6NodeFound;
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
            if (!options.filename) {
                options.filename = context.filename;
            }
            log.debug("Transforming %s", options.filename);
            try {
                context.source = babel.transform(context.source, options).code;
                context.js.ast = acorn.parse(context.source, { sourceType: "module" });
                return callback(undefined, true);
            }
            catch (error) {
                return callback(error, false);
            }
        }
        else {
            return callback(undefined, false);
        }
    };
    var initialize = function (logOptions) {
        log4js.setGlobalLogLevel(logOptions.level);
        log4js.configure({ appenders: logOptions.appenders });
        log = log4js.getLogger("es6-transform.karma-typescript");
        walk = require("acorn/dist/walk");
    };
    return Object.assign(transform, { initialize: initialize });
};
module.exports = configure;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNmb3JtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3RyYW5zZm9ybS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsNkJBQStCO0FBQy9CLGtDQUFvQztBQUVwQywrQkFBaUM7QUFJakMsSUFBSSxHQUFrQixDQUFDO0FBQ3ZCLElBQUksSUFBUyxDQUFDO0FBRWQsSUFBSSxLQUFLLEdBQUcsVUFBQyxHQUFtQjtJQUM1QixJQUFJLFlBQVksR0FBRyxLQUFLLENBQUM7SUFDekIsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDWCxJQUFJLFNBQVMsR0FBRyxVQUFDLElBQVMsRUFBRSxLQUFVLEVBQUUsQ0FBTTtZQUMxQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7Z0JBQ2hCLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ3JDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO29CQUNoQixLQUFLLGtCQUFrQixDQUFDO29CQUN4QixLQUFLLHNCQUFzQixDQUFDO29CQUM1QixLQUFLLDBCQUEwQixDQUFDO29CQUNoQyxLQUFLLHdCQUF3QixDQUFDO29CQUM5QixLQUFLLG1CQUFtQjt3QkFDcEIsWUFBWSxHQUFHLElBQUksQ0FBQzt3QkFDcEIsS0FBSyxDQUFDO29CQUNWLEtBQUsscUJBQXFCO3dCQUN0QixJQUFJLG1CQUFtQixHQUFpQyxJQUFLLENBQUM7d0JBQzlELEVBQUUsQ0FBQyxDQUFDLG1CQUFtQixDQUFDLElBQUksS0FBSyxPQUFPLElBQUksbUJBQW1CLENBQUMsSUFBSSxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUM7NEJBQzdFLFlBQVksR0FBRyxJQUFJLENBQUM7NEJBQ3BCLEtBQUssQ0FBQzt3QkFDVixDQUFD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