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
                    case "ArrowFunctionExpression":
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
            options.filename = context.filename;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNmb3JtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3RyYW5zZm9ybS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsNkJBQStCO0FBQy9CLGtDQUFvQztBQUVwQywrQkFBaUM7QUFJakMsSUFBSSxHQUFrQixDQUFDO0FBQ3ZCLElBQUksSUFBUyxDQUFDO0FBRWQsSUFBSSxLQUFLLEdBQUcsVUFBQyxHQUFtQjtJQUM1QixJQUFJLFlBQVksR0FBRyxLQUFLLENBQUM7SUFDekIsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDWCxJQUFJLFNBQVMsR0FBRyxVQUFDLElBQVMsRUFBRSxLQUFVLEVBQUUsQ0FBTTtZQUMxQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7Z0JBQ2hCLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ3JDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO29CQUNoQixLQUFLLHlCQUF5QixDQUFDO29CQUMvQixLQUFLLGtCQUFrQixDQUFDO29CQUN4QixLQUFLLHNCQUFzQixDQUFDO29CQUM1QixLQUFLLDBCQUEwQixDQUFDO29CQUNoQyxLQUFLLHdCQUF3QixDQUFDO29CQUM5QixLQUFLLG1CQUFtQjt3QkFDcEIsWUFBWSxHQUFHLElBQUksQ0FBQzt3QkFDcEIsS0FBSyxDQUFDO29CQUNWLEtBQUsscUJBQXFCO3dCQUN0QixJQUFJLG1CQUFtQixHQUFpQyxJQUFLLENBQUM7d0JBQzlELEVBQUUsQ0FBQyxDQUFDLG1CQUFtQixDQUFDLElBQUksS0FBSyxPQUFPLElBQUksbUJBQW1CLENBQUMsSUFBSSxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUM7NEJBQzdFLFlBQVksR0FBRyxJQUFJLENBQUM7NEJB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