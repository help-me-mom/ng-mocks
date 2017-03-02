import * as fs from "fs";
import * as log4js from "log4js";
import * as path from "path";
import * as ts from "typescript";

import { Transform, TransformCallback, TransformContext } from "karma-typescript/src/api";

let config = "./log4js.json";
if (fs.existsSync(config)) {
    log4js.configure(config);
}
let log = log4js.getLogger("angular2-transform.karma-typescript");

let fixWindowsPath = (value: string): string => {
    return value.replace(/\\/g, "/");
};

let transform: Transform = (context: TransformContext, callback: TransformCallback) => {

    if (ts.version !== context.tsVersion) {
        return callback(new Error("Typescript version of karma-typescript (" +
            context.tsVersion + ") does not match karma-typescript-angular2-transform Typescript version (" +
            ts.version + ")"), false);
    }

    let dirty = false;
    let MagicString = require("magic-string");
    let magic = new MagicString(context.source);

    let rewriteUrl = (node: ts.StringLiteral): void => {

        let start = node.getStart() + 1;
        let end = start + node.text.length;
        let templateDir = path.dirname(context.filename);
        let relativeTemplateDir = path.relative(context.basePath, templateDir);
        let styleUrl = path.join(context.urlRoot, "base", relativeTemplateDir, node.text);

        log.debug("Rewriting %s to %s in %s", node.text, styleUrl, context.filename);

        magic.overwrite(start, end, fixWindowsPath(styleUrl));
        dirty = true;
    };

    let visitNode = (node: ts.Node) => {
        switch (node.kind) {
            case ts.SyntaxKind.ObjectLiteralExpression:

                let expression = (<ts.ObjectLiteralExpression> node);

                if (expression.properties) {
                    expression.properties.forEach((p) => {

                        if (p.name && p.kind === ts.SyntaxKind.PropertyAssignment) {

                            let property = (<ts.PropertyAssignment> p);
                            let identifier = (<ts.Identifier> property.name);

                            if (identifier.text === "templateUrl" &&
                                    property.initializer.kind === ts.SyntaxKind.StringLiteral) {

                                rewriteUrl((<ts.StringLiteral> property.initializer));
                            }

                            if (identifier.text === "styleUrls" &&
                                    property.initializer.kind === ts.SyntaxKind.ArrayLiteralExpression) {

                                let initializer = (<ts.ArrayLiteralExpression> property.initializer);
                                initializer.elements.forEach((element) => {
                                    if (element.kind === ts.SyntaxKind.StringLiteral) {
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

    visitNode((<ts.SourceFile> context.ast));

    if (dirty) {
        context.source = magic.toString();
    }

    callback(undefined, dirty);
};

export = transform;
