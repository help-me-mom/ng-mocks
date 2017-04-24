import * as log4js from "log4js";
import * as os from "os";
import * as postcss from "postcss";

import * as kt from "karma-typescript/src/api/transforms";

let log: log4js.Logger;
let json: { [key: string]: string; } = {};
let parser = postcss.plugin("karma-typescript-cssmodules-transform-parser", () => {
    return (css) => {
        css.walkRules((rule) => {
            if (rule.selector === ":export") {
                rule.walkDecls((decl) => {
                    json[decl.prop] = decl.value;
                });
                rule.remove();
            }
        });
    };
});

let configure = (postcssOptions?: postcss.ProcessOptions, options?: any, filter?: RegExp) => {

    postcssOptions = postcssOptions || {};
    options = options || {};
    filter = (filter instanceof RegExp) ? filter : /\.css$/;

    let genericNames = require("generic-names");
    let scopedNameGenerator = options.generateScopedName || "[name]_[local]_[hash:base64:5]";

    let transform: kt.Transform = (context: kt.TransformContext, callback: kt.TransformCallback) => {

        postcssOptions.from = context.filename;
        postcssOptions.to = context.filename;

        if (context.filename.match(filter)) {

            log.debug("Transforming %s", context.filename);

            if (!context.source) {
                return callback(new Error("File is empty"), false);
            }

            let plugins = [
                require("postcss-modules-local-by-default")({ mode: options.mode }),
                require("postcss-modules-extract-imports"),
                require("postcss-modules-scope")({ generateScopedName: genericNames(scopedNameGenerator, {
                    context: context.filename
                })}),
                require("postcss-modules-values"),
                parser
            ];

            postcss(plugins)
                .process(context.source, postcssOptions)
                .then((result) => {
                    result.warnings().forEach((warning) => {
                        log.warn(warning.toString());
                    });
                    context.source = JSON.stringify(json);
                    callback(undefined, true);
                }, (error) => {
                    if (error.name === "CssSyntaxError") {
                        log.warn(error.message + os.EOL + (<postcss.CssSyntaxError> error).showSourceCode());
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

    let initialize: kt.TransformInitialize = (logOptions: kt.TransformInitializeLogOptions) => {
        log4js.setGlobalLogLevel(logOptions.level);
        log4js.configure({ appenders: logOptions.appenders });
        log = log4js.getLogger("cssmodules-transform.karma-typescript");
    };

    return Object.assign(transform, { initialize });
};

export = configure;
