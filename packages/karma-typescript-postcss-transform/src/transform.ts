import * as log4js from "log4js";
import * as os from "os";
import * as postcss from "postcss";

import * as kt from "karma-typescript/src/api/transforms";

let log: log4js.Logger;

let configure = (plugins?: postcss.AcceptedPlugin[], options?: postcss.ProcessOptions, filter?: RegExp) => {

    options = options || {};
    filter = (filter instanceof RegExp) ? filter : /\.css$/;

    let transform: kt.Transform = (context: kt.TransformContext, callback: kt.TransformCallback) => {

        options.from = context.filename;
        options.to = context.filename;

        if (context.filename.match(filter)) {

            log.debug("Transforming %s", context.filename);

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
        log = log4js.getLogger("postcss-transform.karma-typescript");
    };

    return Object.assign(transform, { initialize });
};

export = configure;
