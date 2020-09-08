import * as kt from "karma-typescript";
import * as log4js from "log4js";
import * as os from "os";
import * as postcss from "postcss";

let log: log4js.Logger;

const configure = (plugins?: postcss.AcceptedPlugin[], options?: postcss.ProcessOptions, filter?: RegExp) : kt.Transform => {

    options = options || {};
    filter = (filter instanceof RegExp) ? filter : /\.css$/;

    const transform: kt.Transform = (context: kt.TransformContext, callback: kt.TransformCallback) => {

        options.from = context.filename;
        options.to = context.filename;

        if (context.filename.match(filter)) {

            log.debug("Transforming %s", context.filename);

            if (!context.source) {
                return callback(new Error("File is empty"), false);
            }

            postcss(plugins)
                .process(context.source, options)
                .then((result) => {
                    result.warnings().forEach((warning) => {
                        log.warn(warning.toString());
                    });
                    context.source = result.css;
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
        log = log4js.getLogger("postcss-transform.karma-typescript");
    };

    return Object.assign(transform, { initialize });
};

export = configure;
