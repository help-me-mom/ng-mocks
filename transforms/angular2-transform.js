var MagicString = require("magic-string"),
    path = require("path"),
    ts = require("typescript");

module.exports = function angular2Transform(context, callback) {

    var dirty = false,
        magic = new MagicString(context.source);

    visitNode(context.ast);

    function visitNode(node) {
        switch (node.kind) {
            case ts.SyntaxKind.ObjectLiteralExpression:
                if(node.properties) {
                    node.properties.forEach(function(property) {

                        if(property.name) {

                            if(property.name.text === "templateUrl") {
                                rewriteUrl(property.initializer);
                            }
    
                            if(property.name.text === "styleUrls") {
                                
                                property.initializer.elements.forEach(function(e) {

                                    rewriteUrl(e);
                                });
                            }
                        }
                    });
                }
        }

        ts.forEachChild(node, visitNode);
    }

    function rewriteUrl(node) {

        var start = node.getStart() + 1,
            end = start + node.text.length,
            templateDir = path.dirname(context.filename),
            relativeTemplateDir = path.relative(context.basePath, templateDir),
            styleUrl = path.join(context.urlRoot, "base", relativeTemplateDir, node.text);

        magic.overwrite(start, end, fixWindowsPath(styleUrl));
        dirty = true;
    }

    if(dirty) {
        context.source = magic.toString();
    }

    callback(undefined, dirty);
};

function fixWindowsPath(value) {
    return value.replace(/\\/g, "/");
}
