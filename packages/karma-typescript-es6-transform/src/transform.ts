import * as acorn from "acorn";
import * as babel from "babel-core";
import * as ESTree from "estree";
import * as fs from "fs";
import * as log4js from "log4js";

import { Transform, TransformCallback, TransformContext } from "karma-typescript/src/api";

let config = "./log4js.json";
if (fs.existsSync(config)) {
    log4js.configure(config);
}
let log = log4js.getLogger("es6-transform.karma-typescript");

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

        if (isEs6((<ESTree.Program> context.ast))) {

            log.debug("Transforming %s", context.filename);

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

export = initialize;
