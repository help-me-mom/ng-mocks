"use strict";
var log4js = require("log4js");
var os = require("os");
var postcss = require("postcss");
var log;
var json = {};
var exportsPlugin = postcss.plugin("karma-typescript-cssmodules-transform-parser", function () {
    return function (css) {
        css.walkRules(function (rule) {
            if (rule.selector === ":export") {
                rule.walkDecls(function (decl) {
                    json[decl.prop] = decl.value;
                });
                rule.remove();
            }
        });
    };
});
var configure = function (postcssOptions, options, filter) {
    postcssOptions = postcssOptions || {};
    options = options || {};
    filter = (filter instanceof RegExp) ? filter : /\.css$/;
    var genericNames = require("generic-names");
    var scopedNameGenerator = options.generateScopedName || "[name]_[local]_[hash:base64:5]";
    var transform = function (context, callback) {
        postcssOptions.from = context.filename;
        postcssOptions.to = context.filename;
        if (context.filename.match(filter)) {
            log.debug("Transforming %s", context.filename);
            if (!context.source) {
                return callback(new Error("File is empty"), false);
            }
            var plugins = [
                require("postcss-modules-local-by-default")({ mode: options.mode }),
                require("postcss-modules-extract-imports"),
                require("postcss-modules-scope")({ generateScopedName: genericNames(scopedNameGenerator, {
                        context: context.filename
                    }) }),
                require("postcss-modules-values"),
                exportsPlugin
            ];
            postcss(plugins)
                .process(context.source, postcssOptions)
                .then(function (result) {
                result.warnings().forEach(function (warning) {
                    log.warn(warning.toString());
                });
                context.source = JSON.stringify(json);
                callback(undefined, true);
            }, function (error) {
                if (error.name === "CssSyntaxError") {
                    log.warn(error.message + os.EOL + error.showSourceCode());
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
    var initialize = function (logOptions) {
        log4js.setGlobalLogLevel(logOptions.level);
        log4js.configure({ appenders: logOptions.appenders });
        log = log4js.getLogger("cssmodules-transform.karma-typescript");
    };
    return Object.assign(transform, { initialize: initialize });
};
module.exports = configure;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNmb3JtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3RyYW5zZm9ybS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsK0JBQWlDO0FBQ2pDLHVCQUF5QjtBQUN6QixpQ0FBbUM7QUFJbkMsSUFBSSxHQUFrQixDQUFDO0FBQ3ZCLElBQUksSUFBSSxHQUErQixFQUFFLENBQUM7QUFDMUMsSUFBSSxhQUFhLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyw4Q0FBOEMsRUFBRTtJQUMvRSxNQUFNLENBQUMsVUFBQyxHQUFHO1FBQ1AsR0FBRyxDQUFDLFNBQVMsQ0FBQyxVQUFDLElBQUk7WUFDZixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUM7Z0JBQzlCLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBQyxJQUFJO29CQUNoQixJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7Z0JBQ2pDLENBQUMsQ0FBQyxDQUFDO2dCQUNILElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNsQixDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDLENBQUM7QUFDTixDQUFDLENBQUMsQ0FBQztBQUVILElBQUksU0FBUyxHQUFHLFVBQUMsY0FBdUMsRUFBRSxPQUFhLEVBQUUsTUFBZTtJQUVwRixjQUFjLEdBQUcsY0FBYyxJQUFJLEVBQUUsQ0FBQztJQUN0QyxPQUFPLEdBQUcsT0FBTyxJQUFJLEVBQUUsQ0FBQztJQUN4QixNQUFNLEdBQUcsQ0FBQyxNQUFNLFlBQVksTUFBTSxDQUFDLEdBQUcsTUFBTSxHQUFHLFFBQVEsQ0FBQztJQUV4RCxJQUFJLFlBQVksR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUM7SUFDNUMsSUFBSSxtQkFBbUIsR0FBRyxPQUFPLENBQUMsa0JBQWtCLElBQUksZ0NBQWdDLENBQUM7SUFFekYsSUFBSSxTQUFT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