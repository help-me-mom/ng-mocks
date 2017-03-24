import * as async from "async";
import * as diff from "diff";
import * as glob from "glob";
import * as lodash from "lodash";
import * as os from "os";
import * as path from "path";
import * as ts from "typescript";

import { Logger } from "log4js";

import pad = require("pad");

import { Queued } from "./queued";
import { RequiredModule } from "./required-module";

export class DependencyWalker {

    private requireRegexp = /\brequire\b/;
    private walk = require("acorn/dist/walk");

    constructor(private log: Logger) {}

    public hasRequire(s: string): boolean {
        return this.requireRegexp.test(s);
    }

    public collectRequiredTsModules(queue: Queued[]): number {

        let requiredModuleCount: number = 0;

        queue.forEach((queued) => {

            queued.module.requiredModules = this.findUnresolvedTsRequires(queued.emitOutput.sourceFile);

            let resolvedModules = (<any> queued.emitOutput.sourceFile).resolvedModules;

            if (resolvedModules && !queued.emitOutput.sourceFile.isDeclarationFile) {

                if (lodash.isMap(resolvedModules)) { // Typescript 2.2+
                    resolvedModules.forEach((resolvedModule: any, moduleName: string) => {
                        queued.module.requiredModules.push(
                            new RequiredModule(moduleName, resolvedModule && resolvedModule.resolvedFileName));
                    });
                }
                else { // Typescript 1.6.2 - 2.1.6
                    Object.keys(resolvedModules).forEach((moduleName: string) => {
                        let resolvedModule = resolvedModules[moduleName];
                        queued.module.requiredModules.push(
                            new RequiredModule(moduleName, resolvedModule && resolvedModule.resolvedFileName));
                    });
                }
            }

            requiredModuleCount += queued.module.requiredModules.length;
        });

        this.validateCase(queue);

        return requiredModuleCount;
    }

    public collectRequiredJsModules(requiredModule: RequiredModule,
                                    onRequiredModulesCollected: { (moduleNames: string[]): void }): void {

        let moduleNames: string[] = [];
        let expressions: any[] = [];

        let isRequire = (node: any) => {
            return node.type === "CallExpression" &&
                   node.callee.type === "Identifier" &&
                   node.callee.name === "require";
        };

        let visitNode = (node: any, state: any, c: any)  => {
            if (!this.hasRequire(requiredModule.source.slice(node.start, node.end))) {
                return;
            }
            this.walk.base[node.type](node, state, c);
            if (isRequire(node) && node.arguments.length > 0) {
                if (node.arguments[0].type === "Literal") {
                    moduleNames.push(node.arguments[0].value);
                }
                else {
                    expressions.push(node.arguments[0]);
                }
            }
        };

        this.walk.recursive(requiredModule.ast, null, {
            Expression: visitNode,
            Statement: visitNode
        });

        this.addDynamicDependencies(expressions, requiredModule, (dynamicDependencies) => {
            onRequiredModulesCollected(moduleNames.concat(dynamicDependencies));
        });
    }

    private findUnresolvedTsRequires(sourceFile: ts.SourceFile): RequiredModule[] {

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

    private addDynamicDependencies(expressions: any[],
                                   requiredModule: RequiredModule,
                                   onDynamicDependenciesAdded: { (dynamicDependencies: string[]): void }) {

        let dynamicDependencies: string[] = [];

        if (expressions.length === 0) {
            process.nextTick(() => {
                onDynamicDependenciesAdded(dynamicDependencies);
            });
            return;
        }

        async.each(expressions, (expression, onExpressionResolved) => {

            let dynamicModuleName = this.parseDynamicRequire(expression);
            let directory = path.dirname(requiredModule.filename);
            let pattern: string;

            if (dynamicModuleName && dynamicModuleName !== "*") {
                if (new RequiredModule(dynamicModuleName).isNpmModule()) {
                    dynamicDependencies.push(dynamicModuleName);
                    onExpressionResolved();
                }
                else {
                    pattern = path.join(directory, dynamicModuleName);
                    glob(pattern, (error, matches) => {
                        if (error) {
                            throw error;
                        }
                        matches.forEach((match) => {
                            this.log.debug("Dynamic require: \nexpression: [%s]" +
                                        "\nfilename: %s\nrequired by %s\nglob: %s",
                                JSON.stringify(expression, undefined, 3), match, requiredModule.filename, pattern);
                            dynamicDependencies.push("./" + path.relative(directory, match));
                        });
                        onExpressionResolved();
                    });
                }
            }
            else {
                onExpressionResolved();
            }
        }, () => {
            onDynamicDependenciesAdded(dynamicDependencies);
        });
    }

    private parseDynamicRequire(expression: any): string {

        let visitNode = (node: any): string => {
            switch (node.type) {
                case "BinaryExpression":
                    if (node.operator === "+") {
                        return visitNode(node.left) + visitNode(node.right);
                    }
                    break;
                case "ExpressionStatement":
                    return visitNode(node.expression);
                case "Literal":
                    return node.value + "";
                case "Identifier":
                    return "*";
                default:
                    return "";
            }
        };

        return visitNode(expression);
    }

    private validateCase(queue: Queued[]) {

        let files = queue.map((q) => {
            return q.file.originalPath;
        });

        let fileslower = queue.map((q) => {
            return q.file.originalPath.toLowerCase();
        });

        queue.forEach((queued) => {
            if (queued.module.requiredModules) {
                queued.module.requiredModules.forEach((requiredModule) => {
                    if (requiredModule.filename && files.indexOf(requiredModule.filename) === -1) {
                        let lowerIndex = fileslower.indexOf(requiredModule.filename.toLowerCase());
                        if (lowerIndex !== -1) {

                            let result = diff.diffChars(files[lowerIndex], requiredModule.filename);
                            let arrows = "";
                            result.forEach((part) => {
                                if (part.added) {
                                    arrows += "^";
                                }
                                else if (!part.removed){
                                    arrows += pad("", part.count);
                                }
                            });

                            throw new Error("Uppercase/lowercase mismatch importing " +
                                requiredModule.moduleName + " from " + queued.file.originalPath +
                                ":" + os.EOL + os.EOL +
                                "filename:    " + files[lowerIndex] + os.EOL +
                                "module name: " + requiredModule.filename + os.EOL +
                                "             " + arrows + os.EOL);
                        }
                    }
                });
            }
        });
    }
}
