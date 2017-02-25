import * as path from "path";
import * as ts from "typescript";

import { Transform, TransformCallback, TransformContext } from "karma-typescript/src/api";

let fixWindowsPath = (value: string): string => {
    return value.replace(/\\/g, "/");
};

let transform: Transform = (context: TransformContext, callback: TransformCallback) => {

    let dirty = false;
    let MagicString = require("magic-string");
    let magic = new MagicString(context.source);

    let rewriteUrl = (node: ts.StringLiteral): void => {

        let start = node.getStart() + 1;
        let end = start + node.text.length;
        let templateDir = path.dirname(context.filename);
        let relativeTemplateDir = path.relative(context.basePath, templateDir);
        let styleUrl = path.join(context.urlRoot, "base", relativeTemplateDir, node.text);

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
