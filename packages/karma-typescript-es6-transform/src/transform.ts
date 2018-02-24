import * as acorn from "acorn";
import * as babel from "babel-core";
import * as ESTree from "estree";
import * as log4js from "log4js";

import * as kt from "karma-typescript/src/api/transforms";

let log: log4js.Logger;
let walk: any;

const isEs6 = (ast: ESTree.Program): boolean => {
    let es6NodeFound = false;
    if (ast.body) {
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
                        const variableDeclaration = (node as ESTree.VariableDeclaration);
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

const configure = (options?: babel.TransformOptions) => {

    options = options || {};

    if (!options.presets || options.presets.length === 0) {
        options.presets = [["env"]];
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
        log4js.setGlobalLogLevel(logOptions.level);
        log4js.configure({ appenders: logOptions.appenders });
        log = log4js.getLogger("es6-transform.karma-typescript");
        walk = require("acorn/dist/walk");
    };

    return Object.assign(transform, { initialize });
};

export = configure;
