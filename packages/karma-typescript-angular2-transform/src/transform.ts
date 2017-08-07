import * as kt from "karma-typescript/src/api/transforms";
import * as log4js from "log4js";
import * as path from "path";
import * as ts from "typescript";

let log: log4js.Logger;

let fixWindowsPath = (value: string): string => {
    return value.replace(/\\/g, "/");
};

let transform: kt.Transform = (context: kt.TransformContext, callback: kt.TransformCallback) => {

    if (!context.ts) {
        return callback(undefined, false);
    }

    if (ts.version !== context.ts.version) {
        return callback(new Error("Typescript version of karma-typescript (" +
            context.ts.version + ") does not match karma-typescript-angular2-transform Typescript version (" +
            ts.version + ")"), false);
    }

    let dirty = false;
    let MagicString = require("magic-string");
    let magic = new MagicString(context.source);

    let isStringKind = (kind: ts.SyntaxKind): boolean => {
        return kind === ts.SyntaxKind.StringLiteral || kind === ts.SyntaxKind.NoSubstitutionTemplateLiteral;
    };

    let rewriteUrl = (node: ts.StringLiteral): void => {

        let start = node.getStart() + 1;
        let end = start + node.text.length;
        let templateDir = path.dirname(context.filename);
        let relativeTemplateDir = path.relative(context.config.karma.basePath, templateDir);
        let styleUrl = path.join(context.config.karma.urlRoot, "base", relativeTemplateDir, node.text);

        log.debug("Rewriting %s to %s in %s", node.text, styleUrl, context.filename);

        magic.overwrite(start, end, fixWindowsPath(styleUrl));
        dirty = true;
    };

    let visitNode = (node: ts.Node) => {
        switch (node.kind) {
            case ts.SyntaxKind.ObjectLiteralExpression:

                let expression = (<ts.ObjectLiteralExpression> node);

                /* istanbul ignore else */
                if (expression.properties) {
                    expression.properties.forEach((p) => {

                        /* istanbul ignore else */
                        if (p.name && p.kind === ts.SyntaxKind.PropertyAssignment) {

                            let property = (<ts.PropertyAssignment> p);
                            let identifier = (<ts.Identifier> property.name);

                            if (identifier.text === "templateUrl" &&
                                    isStringKind(property.initializer.kind)) {

                                rewriteUrl((<ts.StringLiteral> property.initializer));
                            }

                            if (identifier.text === "styleUrls" &&
                                    property.initializer.kind === ts.SyntaxKind.ArrayLiteralExpression) {

                                let initializer = (<ts.ArrayLiteralExpression> property.initializer);
                                initializer.elements.forEach((element) => {
                                    /* istanbul ignore else */
                                    if (isStringKind(element.kind)) {
                                        rewriteUrl((<ts.StringLiteral> element));
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

let initialize: kt.TransformInitialize = (logOptions: kt.TransformInitializeLogOptions) => {
    log4js.setGlobalLogLevel(logOptions.level);
    log4js.configure({ appenders: logOptions.appenders });
    log = log4js.getLogger("angular2-transform.karma-typescript");
};

let exp = Object.assign(transform, { initialize });
export = exp;
