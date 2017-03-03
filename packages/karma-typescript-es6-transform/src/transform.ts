import * as acorn from "acorn";
import * as babel from "babel-core";
import * as ESTree from "estree";
import * as log4js from "log4js";

import { Transform, TransformCallback, TransformContext } from "karma-typescript/src/api";

let log: log4js.Logger;

let isEs6 = (ast: ESTree.Program): boolean => {
    if (ast.body) {
        for (let statement of ast.body) {
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

let initialize = (options?: babel.TransformOptions) => {

    options = options || {};

    if (!options.presets || options.presets.length === 0) {
        options.presets = ["es2015"];
    }

    let transform: Transform = (context: TransformContext, callback: TransformCallback) => {

        if (!context.js) {
            return callback(undefined, false);
        }

        if (!log) {
            log4js.setGlobalLogLevel(context.log.level);
            log4js.configure({ appenders: context.log.appenders });
            log = log4js.getLogger("es6-transform.karma-typescript");
        }

        if (isEs6(context.js.ast)) {

            log.debug("Transforming %s", context.paths.filename);

            if (!options.filename) {
                options.filename = context.paths.filename;
            }

            context.source = babel.transform(context.source, options).code;
            context.js.ast = acorn.parse(context.source, { sourceType: "module" });

            return callback(undefined, true);
        }
        else {
            return callback(undefined, false);
        }
    };

    return transform;
};

export = initialize;
