"use strict";
var log4js = require("log4js");
var os = require("os");
var postcss = require("postcss");
var log;
var json = {};
var parser = postcss.plugin("karma-typescript-cssmodules-transform-parser", function () {
    return function (css) {
        css.walkRules(function (rule) {
            if (rule.selector === ":export") {
                rule.walkDecls(function (decl) {
                    json[decl.prop] = decl.value;
                });
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
                parser
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNmb3JtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3RyYW5zZm9ybS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsK0JBQWlDO0FBQ2pDLHVCQUF5QjtBQUN6QixpQ0FBbUM7QUFJbkMsSUFBSSxHQUFrQixDQUFDO0FBQ3ZCLElBQUksSUFBSSxHQUErQixFQUFFLENBQUM7QUFDMUMsSUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyw4Q0FBOEMsRUFBRTtJQUN4RSxNQUFNLENBQUMsVUFBQyxHQUFHO1FBQ1AsR0FBRyxDQUFDLFNBQVMsQ0FBQyxVQUFDLElBQUk7WUFDZixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUM7Z0JBQzlCLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBQyxJQUFJO29CQUNoQixJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7Z0JBQ2pDLENBQUMsQ0FBQyxDQUFDO1lBQ1AsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQyxDQUFDO0FBQ04sQ0FBQyxDQUFDLENBQUM7QUFFSCxJQUFJLFNBQVMsR0FBRyxVQUFDLGNBQXVDLEVBQUUsT0FBYSxFQUFFLE1BQWU7SUFFcEYsY0FBYyxHQUFHLGNBQWMsSUFBSSxFQUFFLENBQUM7SUFDdEMsT0FBTyxHQUFHLE9BQU8sSUFBSSxFQUFFLENBQUM7SUFDeEIsTUFBTSxHQUFHLENBQUMsTUFBTSxZQUFZLE1BQU0sQ0FBQyxHQUFHLE1BQU0sR0FBRyxRQUFRLENBQUM7SUFFeEQsSUFBSSxZQUFZLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBQzVDLElBQUksbUJBQW1CLEdBQUcsT0FBTyxDQUFDLGtCQUFrQixJQUFJLGdDQUFnQyxDQUFDO0lBRXpGLElBQUksU0FBUyxHQUFpQixVQUFDLE9BQTRCLEVBQUUsUUFBOEI7UUFF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