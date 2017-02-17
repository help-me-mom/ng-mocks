import * as ts from "typescript";
import Queued = require("./queued");
import RequiredModule = require("./required-module");

export function collectRequiredModules(queue: Queued[]): number {

    let requiredModuleCount: number = 0;

    queue.forEach((queued) => {

        queued.module.requiredModules = findUnresolvedRequires(queued.emitOutput.sourceFile);

        if ((<any> queued.emitOutput.sourceFile).resolvedModules && !queued.emitOutput.sourceFile.isDeclarationFile) {

            Object.keys((<any> queued.emitOutput.sourceFile).resolvedModules).forEach((moduleName) => {

                let resolvedModule = (<any> queued.emitOutput.sourceFile).resolvedModules[moduleName];
                queued.module.requiredModules.push(
                    new RequiredModule(moduleName, resolvedModule && resolvedModule.resolvedFileName));
            });
        }

        requiredModuleCount += queued.module.requiredModules.length;
    });

    return requiredModuleCount;
}

export function findUnresolvedRequires(sourceFile: ts.SourceFile): RequiredModule[] {

    let requiredModules: RequiredModule[] = [];

    if ((<any> ts).isDeclarationFile(sourceFile)) {
        return requiredModules;
    }

    let visitNode = (node: ts.Node) => {

        if (node.kind === ts.SyntaxKind.CallExpression) {

            let ce = (<ts.CallExpression> node);

            let expression = ce.expression ?
                (<ts.LiteralExpression> ce.expression) :
                undefined;

            let argument = ce.arguments && ce.arguments.length ?
                (<ts.LiteralExpression> ce.arguments[0]) :
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
