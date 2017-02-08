var MagicString = require("magic-string"),
    path = require("path"),
    ts = require("typescript");

module.exports = function angularTemplateUrlRewriter(context, callback) {

    var changed = false,
        magic = new MagicString(context.fullText);

    visitNode(context.sourceFile);

    function visitNode(node) {
        switch (node.kind) {
            case ts.SyntaxKind.ObjectLiteralExpression:
                if(node.properties) {
                    node.properties.forEach(function(property) {
                        if(property.name.text === "templateUrl") {

                            var start = property.initializer.getStart() + 1,
                                end = start + property.initializer.text.length,
                                templateDir = path.dirname(context.filename),
                                relativeTemplateDir = path.relative(context.basePath, templateDir),
                                templateUrl = path.join(context.urlRoot, "base", relativeTemplateDir, property.initializer.text);

                            magic.overwrite(start, end, templateUrl);
                            context.fullText = magic.toString();
                            changed = true;
                        }
                    });
                }
        }

        ts.forEachChild(node, visitNode);
    }

    callback(changed);
};