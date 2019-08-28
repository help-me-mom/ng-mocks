import * as babel from "@babel/core";
import * as acorn from "acorn";
import * as kt from "karma-typescript";
import * as log4js from "log4js";

let log: log4js.Logger;
let walk: any;

const isEs6 = (ast: acorn.Node): boolean => {
    let es6NodeFound = false;
    if ((ast as any).body) {
        const visitNode = (node: any, state: any, c: any)  => {
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
                        if (node.kind === "const" || node.kind === "let") {
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

const configure = (options?: babel.TransformOptions) => {

    options = options || {};

    if (!options.presets || options.presets.length === 0) {
        options.presets = [["@babel/preset-env"]];
    }

    const transform: kt.Transform = (context: kt.TransformContext, callback: kt.TransformCallback) => {

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

    const initialize: kt.TransformInitialize = (logOptions: kt.TransformInitializeLogOptions) => {
        log4js.configure({
            appenders: logOptions.appenders,
            categories: {
                default: {
                    appenders: Object.keys(logOptions.appenders),
                    level: logOptions.level
                }
            }
        });
        log = log4js.getLogger("es6-transform.karma-typescript");
        walk = require("acorn-walk");
    };

    return Object.assign(transform, { initialize });
};

export = configure;
