"use strict";
var log4js = require("log4js");
var os = require("os");
var postcss = require("postcss");
var log;
var configure = function (plugins, options, filter) {
    options = options || {};
    filter = (filter instanceof RegExp) ? filter : /\.css$/;
    var transform = function (context, callback) {
        options.from = context.filename;
        options.to = context.filename;
        if (context.filename.match(filter)) {
            log.debug("Transforming %s", context.filename);
            if (!context.source) {
                return callback(new Error("File is empty"), false);
            }
            postcss(plugins)
                .process(context.source, options)
                .then(function (result) {
                result.warnings().forEach(function (warning) {
                    log.warn(warning.toString());
                });
                context.source = result.css;
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
        log = log4js.getLogger("postcss-transform.karma-typescript");
    };
    return Object.assign(transform, { initialize: initialize });
};
module.exports = configure;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNmb3JtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3RyYW5zZm9ybS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsK0JBQWlDO0FBQ2pDLHVCQUF5QjtBQUN6QixpQ0FBbUM7QUFJbkMsSUFBSSxHQUFrQixDQUFDO0FBRXZCLElBQUksU0FBUyxHQUFHLFVBQUMsT0FBa0MsRUFBRSxPQUFnQyxFQUFFLE1BQWU7SUFFbEcsT0FBTyxHQUFHLE9BQU8sSUFBSSxFQUFFLENBQUM7SUFDeEIsTUFBTSxHQUFHLENBQUMsTUFBTSxZQUFZLE1BQU0sQ0FBQyxHQUFHLE1BQU0sR0FBRyxRQUFRLENBQUM7SUFFeEQsSUFBSSxTQUFTLEdBQWlCLFVBQUMsT0FBNEIsRUFBRSxRQUE4QjtRQUV2RixPQUFPLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUM7UUFDaEMsT0FBTyxDQUFDLEVBQUUsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDO1FBRTlCLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVqQyxHQUFHLENBQUMsS0FBSyxDQUFDLGlCQUFpQixFQUFFLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUUvQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO2dCQUNsQixNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksS0FBSyxDQUFDLGVBQWUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ3ZELENBQUM7WUFFRCxPQUFPLENBQUMsT0FBTyxDQUFDO2lCQUNYLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQztpQkFDaEMsSUFBSSxDQUFDLFVBQUMsTUFBTTtnQkFDVCxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUMsT0FBTyxDQUFDLFVBQUMsT0FBTztvQkFDOUIsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztnQkFDakMsQ0FBQyxDQUFDLENBQUM7Z0JBQ0gsT0FBTyxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDO2dCQUM1QixRQUFRLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQzlCLENBQUMsRUFBRSxVQUFDLEtBQUs7Z0JBQ0wsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksS0FBSyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7b0JBQ2xDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUMsR0FBRyxHQUE2QixLQUFNLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQztvQkFDckYsUUFBUSxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDL0IsQ0FBQztnQkFDRCxJQUFJLENBQUMsQ0FBQztvQkFDRixRQUFRLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUMzQixDQUFDO1lBQ0wsQ0FBQyxDQUFDLENBQUM7UUFDWCxDQUFDO1FBQ0QsSUFBSSxDQUFDLENBQUM7WUFDRixNQUFNLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN0QyxDQUFDO0lBQ0wsQ0FBQyxDQUFDO0lBRUYsSUFBSSxVQUFVLEdBQTJCLFVBQUMsVUFBNEM7UUFDbEYsTUFBTSxDQUFDLGlCQUFpQixDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUMzQyxNQUFNLENBQUMsU0FBUyxDQUFDLEVBQUUsU0FBUyxFQUFFLFVBQVUsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDO1FBQ3RELEdBQUcsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLG9DQUFvQyxDQUFDLENBQUM7SUFDakUsQ0FBQyxDQUFDO0lBRUYsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLEVBQUUsVUFBVSxZQUFBLEVBQUUsQ0FBQyxDQUFDO0FBQ3BELENBQUMsQ0FBQztBQUVGLGlCQUFTLFNBQVMsQ0FBQyJ9