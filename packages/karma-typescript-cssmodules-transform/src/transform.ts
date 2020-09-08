import * as kt from "karma-typescript";
import * as log4js from "log4js";
import * as os from "os";
import * as postcss from "postcss";

let log: log4js.Logger;
const json: { [key: string]: string; } = {};
const parser = postcss.plugin("karma-typescript-cssmodules-transform-parser", () => {
    return (css) => {
        css.walkRules((rule) => {
            if (rule.selector === ":export") {
                rule.walkDecls((decl) => {
                    json[decl.prop] = decl.value;
                });
            }
        });
    };
});

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const configure = (postcssOptions?: postcss.ProcessOptions, options?: any, filter?: RegExp) : kt.Transform => {

    postcssOptions = postcssOptions || {};
    options = options || {};
    filter = (filter instanceof RegExp) ? filter : /\.css$/;

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const genericNames = require("generic-names");
    const scopedNameGenerator = options.generateScopedName || "[name]_[local]_[hash:base64:5]";

    const transform: kt.Transform = (context: kt.TransformContext, callback: kt.TransformCallback) => {

        postcssOptions.from = context.filename;
        postcssOptions.to = context.filename;

        if (context.filename.match(filter)) {

            log.debug("Transforming %s", context.filename);

            if (!context.source) {
                return callback(new Error("File is empty"), false);
            }

            const plugins = [
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                require("postcss-modules-local-by-default")({ mode: options.mode }),
                require("postcss-modules-extract-imports"),
                // eslint-disable-next-line @typescript-eslint/no-var-requires
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
                        log.warn(error.message + os.EOL + (error as postcss.CssSyntaxError).showSourceCode());
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
        log = log4js.getLogger("cssmodules-transform.karma-typescript");
    };

    return Object.assign(transform, { initialize });
};

export = configure;
