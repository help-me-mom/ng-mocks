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
//# sourceMappingURL=transform.js.map