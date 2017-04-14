"use strict";
var log4js = require("log4js");
var path = require("path");
var ts = require("typescript");
var log;
var fixWindowsPath = function (value) {
    return value.replace(/\\/g, "/");
};
var transform = function (context, callback) {
    if (!context.ts) {
        return callback(undefined, false);
    }
    if (ts.version !== context.ts.version) {
        return callback(new Error("Typescript version of karma-typescript (" +
            context.ts.version + ") does not match karma-typescript-angular2-transform Typescript version (" +
            ts.version + ")"), false);
    }
    var dirty = false;
    var MagicString = require("magic-string");
    var magic = new MagicString(context.source);
    var rewriteUrl = function (node) {
        var start = node.getStart() + 1;
        var end = start + node.text.length;
        var templateDir = path.dirname(context.filename);
        var relativeTemplateDir = path.relative(context.config.karma.basePath, templateDir);
        var styleUrl = path.join(context.config.karma.urlRoot, "base", relativeTemplateDir, node.text);
        log.debug("Rewriting %s to %s in %s", node.text, styleUrl, context.filename);
        magic.overwrite(start, end, fixWindowsPath(styleUrl));
        dirty = true;
    };
    var visitNode = function (node) {
        switch (node.kind) {
            case ts.SyntaxKind.ObjectLiteralExpression:
                var expression = node;
                /* istanbul ignore else */
                if (expression.properties) {
                    expression.properties.forEach(function (p) {
                        /* istanbul ignore else */
                        if (p.name && p.kind === ts.SyntaxKind.PropertyAssignment) {
                            var property = p;
                            var identifier = property.name;
                            if (identifier.text === "templateUrl" &&
                                property.initializer.kind === ts.SyntaxKind.StringLiteral) {
                                rewriteUrl(property.initializer);
                            }
                            if (identifier.text === "styleUrls" &&
                                property.initializer.kind === ts.SyntaxKind.ArrayLiteralExpression) {
                                var initializer = property.initializer;
                                initializer.elements.forEach(function (element) {
                                    /* istanbul ignore else */
                                    if (element.kind === ts.SyntaxKind.StringLiteral) {
                                        rewriteUrl(element);
                                    }
                                });
                            }
                        }
                    });
                }
            default:
        }
        ts.forEachChild(node, visitNode);
    };
    if (context.source.indexOf("templateUrl") > 0 || context.source.indexOf("styleUrls") > 0) {
        visitNode(context.ts.ast);
    }
    if (dirty) {
        context.source = magic.toString();
    }
    callback(undefined, dirty);
};
var initialize = function (logOptions) {
    log4js.setGlobalLogLevel(logOptions.level);
    log4js.configure({ appenders: logOptions.appenders });
    log = log4js.getLogger("angular2-transform.karma-typescript");
};
var exp = Object.assign(transform, { initialize: initialize });
module.exports = exp;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNmb3JtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3RyYW5zZm9ybS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQ0EsK0JBQWlDO0FBQ2pDLDJCQUE2QjtBQUM3QiwrQkFBaUM7QUFFakMsSUFBSSxHQUFrQixDQUFDO0FBRXZCLElBQUksY0FBYyxHQUFHLFVBQUMsS0FBYTtJQUMvQixNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDckMsQ0FBQyxDQUFDO0FBRUYsSUFBSSxTQUFTLEdBQWlCLFVBQUMsT0FBNEIsRUFBRSxRQUE4QjtJQUV2RixFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ2QsTUFBTSxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDdEMsQ0FBQztJQUVELEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxPQUFPLEtBQUssT0FBTyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBQ3BDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxLQUFLLENBQUMsMENBQTBDO1lBQ2hFLE9BQU8sQ0FBQyxFQUFFLENBQUMsT0FBTyxHQUFHLDJFQUEyRTtZQUNoRyxFQUFFLENBQUMsT0FBTyxHQUFHLEdBQUcsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ2xDLENBQUM7SUFFRCxJQUFJLEtBQUssR0FBRyxLQUFLLENBQUM7SUFDbEIsSUFBSSxXQUFXLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQzFDLElBQUksS0FBSyxHQUFHLElBQUksV0FBVyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUU1QyxJQUFJLFVBQVUsR0FBRyxVQUFDLElBQXNCO1FBRXBDLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUM7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