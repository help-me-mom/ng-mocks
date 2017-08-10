"use strict";
var log4js = require("log4js");
var path = require("path");
var log;
var fixWindowsPath = function (value) {
    return value.replace(/\\/g, "/");
};
var transform = function (context, callback) {
    if (!context.ts) {
        return callback(undefined, false);
    }
    var dirty = false;
    var templateUrlRegex = /templateUrl:\s(['"][^"']*['"])/g;
    var styleUrlsRegex = /styleUrls:\s\[(.*)\]/g;
    var quotedStringRegex = /["'](.*?)["']/g;
    var rewriteUrl = function (regexp) {
        var match = regexp.exec(context.ts.transpiled);
        if (!match) {
            return;
        }
        var original = match[0];
        var value = match[1];
        var templateDir = path.dirname(context.filename);
        var relativeTemplateDir = path.relative(context.config.karma.basePath, templateDir);
        var pattern = original;
        var quotedStringMatch = quotedStringRegex.exec(value);
        while (quotedStringMatch) {
            var unquotedString = quotedStringMatch[1];
            var url = path.join(context.config.karma.urlRoot, "base", relativeTemplateDir, unquotedString);
            log.debug("Rewriting %s to %s in %s", unquotedString, url, context.filename);
            pattern = pattern.replace(unquotedString, fixWindowsPath(url));
            quotedStringMatch = quotedStringRegex.exec(value);
        }
        context.ts.transpiled = context.ts.transpiled.replace(original, pattern);
        dirty = true;
    };
    rewriteUrl(styleUrlsRegex);
    rewriteUrl(templateUrlRegex);
    return callback(undefined, dirty, false);
};
var initialize = function (logOptions) {
    log4js.setGlobalLogLevel(logOptions.level);
    log4js.configure({ appenders: logOptions.appenders });
    log = log4js.getLogger("angular2-transform.karma-typescript");
};
var exp = Object.assign(transform, { initialize: initialize });
module.exports = exp;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNmb3JtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3RyYW5zZm9ybS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQ0EsK0JBQWlDO0FBQ2pDLDJCQUE2QjtBQUU3QixJQUFJLEdBQWtCLENBQUM7QUFFdkIsSUFBSSxjQUFjLEdBQUcsVUFBQyxLQUFhO0lBQy9CLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQztBQUNyQyxDQUFDLENBQUM7QUFFRixJQUFJLFNBQVMsR0FBaUIsVUFBQyxPQUE0QixFQUFFLFFBQThCO0lBRXZGLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDZCxNQUFNLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUN0QyxDQUFDO0lBRUQsSUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDO0lBRWxCLElBQU0sZ0JBQWdCLEdBQUcsaUNBQWlDLENBQUM7SUFDM0QsSUFBTSxjQUFjLEdBQUcsdUJBQXVCLENBQUM7SUFDL0MsSUFBTSxpQkFBaUIsR0FBRyxnQkFBZ0IsQ0FBQztJQUUzQyxJQUFNLFVBQVUsR0FBRyxVQUFDLE1BQWM7UUFFOUIsSUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBRWpELEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUNULE1BQU0sQ0FBQztRQUNYLENBQUM7UUFFRCxJQUFNLFFBQVEsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDMUIsSUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3ZCLElBQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ25ELElBQU0sbUJBQW1CLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFFdEYsSUFBSSxPQUFPLEdBQUcsUUFBUSxDQUFDO1FBQ3ZCLElBQUksaUJBQWlCLEdBQUcsaUJBQWlCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRXRELE9BQU8saUJBQWlCLEVBQUUsQ0FBQztZQUV2QixJQUFJLGNBQWMsR0FBRyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMxQyxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsbUJBQW1CLEVBQUUsY0FBYyxDQUFDLENBQUM7WUFDL0YsR0FBRyxDQUFDLEtBQUssQ0FBQywwQkFBMEIsRUFBRSxjQUFjLEVBQUUsR0FBRyxFQUFFLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUU3RSxPQUFPLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxjQUFjLEVBQUUsY0FBYyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0QsaUJBQWlCLEdBQUcsaUJBQWlCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3RELENBQUM7UUFFRCxPQUFPLENBQUMsRUFBRSxDQUFDLFVBQVUsR0FBRyxPQUFPLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3pFLEtBQUssR0FBRyxJQUFJLENBQUM7SUFDakIsQ0FBQyxDQUFDO0lBRUYsVUFBVSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQzNCLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBRTdCLE1BQU0sQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztBQUM3QyxDQUFDLENBQUM7QUFFRixJQUFJLFVBQVUsR0FBMkIsVUFBQyxVQUE0QztJQUNsRixNQUFNLENBQUMsaUJBQWlCLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzNDLE1BQU0sQ0FBQyxTQUFTLENBQUMsRUFBRSxTQUFTLEVBQUUsVUFBVSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7SUFDdEQsR0FBRyxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMscUNBQXFDLENBQUMsQ0FBQztBQUNsRSxDQUFDLENBQUM7QUFFRixJQUFJLEdBQUcsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxFQUFFLFVBQVUsWUFBQSxFQUFFLENBQUMsQ0FBQztBQUNuRCxpQkFBUyxHQUFHLENBQUMifQ==