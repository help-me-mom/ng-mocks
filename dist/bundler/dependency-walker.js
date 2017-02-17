"use strict";
var ts = require("typescript");
var RequiredModule = require("./required-module");
function collectRequiredModules(queue) {
    var requiredModuleCount = 0;
    queue.forEach(function (queued) {
        queued.module.requiredModules = findUnresolvedRequires(queued.emitOutput.sourceFile);
        if (queued.emitOutput.sourceFile.resolvedModules && !queued.emitOutput.sourceFile.isDeclarationFile) {
            Object.keys(queued.emitOutput.sourceFile.resolvedModules).forEach(function (moduleName) {
                var resolvedModule = queued.emitOutput.sourceFile.resolvedModules[moduleName];
                queued.module.requiredModules.push(new RequiredModule(moduleName, resolvedModule && resolvedModule.resolvedFileName));
            });
        }
        requiredModuleCount += queued.module.requiredModules.length;
    });
    return requiredModuleCount;
}
exports.collectRequiredModules = collectRequiredModules;
function findUnresolvedRequires(sourceFile) {
    var requiredModules = [];
    if (ts.isDeclarationFile(sourceFile)) {
        return requiredModules;
    }
    var visitNode = function (node) {
        if (node.kind === ts.SyntaxKind.CallExpression) {
            var ce = node;
            var expression = ce.expression ?
                ce.expression :
                undefined;
            var argument = ce.arguments && ce.arguments.length ?
                ce.arguments[0] :
                undefined;
            if (expression && expression.text === "require" &&
                argument && typeof argument.text === "string") {
                requiredModules.push(new RequiredModule(argument.text));
            }
        }
        ts.forEachChild(node, visitNode);
    };
    visitNode(sourceFile);
    return requiredModules;
}
exports.findUnresolvedRequires = findUnresolvedRequires;
