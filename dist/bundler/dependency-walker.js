"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var async = require("async");
var diff = require("diff");
var glob = require("glob");
var lodash = require("lodash");
var os = require("os");
var path = require("path");
var ts = require("typescript");
var pad = require("pad");
var required_module_1 = require("./required-module");
var DependencyWalker = (function () {
    function DependencyWalker(log) {
        this.log = log;
        this.requireRegexp = /\brequire\b/;
        this.walk = require("acorn/dist/walk");
    }
    DependencyWalker.prototype.hasRequire = function (s) {
        return this.requireRegexp.test(s);
    };
    DependencyWalker.prototype.collectRequiredTsModules = function (queue) {
        var _this = this;
        var requiredModuleCount = 0;
        queue.forEach(function (queued) {
            queued.module.requiredModules = _this.findUnresolvedTsRequires(queued.emitOutput.sourceFile);
            var resolvedModules = queued.emitOutput.sourceFile.resolvedModules;
            if (resolvedModules && !queued.emitOutput.sourceFile.isDeclarationFile) {
                if (lodash.isMap(resolvedModules)) {
                    resolvedModules.forEach(function (resolvedModule, moduleName) {
                        queued.module.requiredModules.push(new required_module_1.RequiredModule(moduleName, resolvedModule && resolvedModule.resolvedFileName));
                    });
                }
                else {
                    Object.keys(resolvedModules).forEach(function (moduleName) {
                        var resolvedModule = resolvedModules[moduleName];
                        queued.module.requiredModules.push(new required_module_1.RequiredModule(moduleName, resolvedModule && resolvedModule.resolvedFileName));
                    });
                }
            }
            requiredModuleCount += queued.module.requiredModules.length;
        });
        this.validateCase(queue);
        return requiredModuleCount;
    };
    DependencyWalker.prototype.collectRequiredJsModules = function (requiredModule, onRequiredModulesCollected) {
        var _this = this;
        var moduleNames = [];
        var expressions = [];
        var isRequire = function (node) {
            return node.type === "CallExpression" &&
                node.callee.type === "Identifier" &&
                node.callee.name === "require";
        };
        var visitNode = function (node, state, c) {
            if (!_this.hasRequire(requiredModule.source.slice(node.start, node.end))) {
                return;
            }
            _this.walk.base[node.type](node, state, c);
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
        this.addDynamicDependencies(expressions, requiredModule, function (dynamicDependencies) {
            onRequiredModulesCollected(moduleNames.concat(dynamicDependencies));
        });
    };
    DependencyWalker.prototype.findUnresolvedTsRequires = function (sourceFile) {
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
                    requiredModules.push(new required_module_1.RequiredModule(argument.text));
                }
            }
            ts.forEachChild(node, visitNode);
        };
        visitNode(sourceFile);
        return requiredModules;
    };
    DependencyWalker.prototype.addDynamicDependencies = function (expressions, requiredModule, onDynamicDependenciesAdded) {
        var _this = this;
        var dynamicDependencies = [];
        if (expressions.length === 0) {
            process.nextTick(function () {
                onDynamicDependenciesAdded(dynamicDependencies);
            });
            return;
        }
        async.each(expressions, function (expression, onExpressionResolved) {
            var dynamicModuleName = _this.parseDynamicRequire(expression);
            var directory = path.dirname(requiredModule.filename);
            var pattern;
            if (dynamicModuleName && dynamicModuleName !== "*") {
                if (new required_module_1.RequiredModule(dynamicModuleName).isNpmModule()) {
                    dynamicDependencies.push(dynamicModuleName);
                    onExpressionResolved();
                }
                else {
                    pattern = path.join(directory, dynamicModuleName);
                    glob(pattern, function (error, matches) {
                        if (error) {
                            throw error;
                        }
                        matches.forEach(function (match) {
                            _this.log.debug("Dynamic require: \nexpression: [%s]" +
                                "\nfilename: %s\nrequired by %s\nglob: %s", JSON.stringify(expression, undefined, 3), match, requiredModule.filename, pattern);
                            dynamicDependencies.push("./" + path.relative(directory, match));
                        });
                        onExpressionResolved();
                    });
                }
            }
            else {
                onExpressionResolved();
            }
        }, function () {
            onDynamicDependenciesAdded(dynamicDependencies);
        });
    };
    DependencyWalker.prototype.parseDynamicRequire = function (expression) {
        var visitNode = function (node) {
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
    };
    DependencyWalker.prototype.validateCase = function (queue) {
        var files = queue.map(function (q) {
            return q.file.originalPath;
        });
        var fileslower = queue.map(function (q) {
            return q.file.originalPath.toLowerCase();
        });
        queue.forEach(function (queued) {
            if (queued.module.requiredModules) {
                queued.module.requiredModules.forEach(function (requiredModule) {
                    if (requiredModule.filename && files.indexOf(requiredModule.filename) === -1) {
                        var lowerIndex = fileslower.indexOf(requiredModule.filename.toLowerCase());
                        if (lowerIndex !== -1) {
                            var result = diff.diffChars(files[lowerIndex], requiredModule.filename);
                            var arrows_1 = "";
                            result.forEach(function (part) {
                                if (part.added) {
                                    arrows_1 += "^";
                                }
                                else if (!part.removed) {
                                    arrows_1 += pad("", part.count);
                                }
                            });
                            throw new Error("Uppercase/lowercase mismatch importing " +
                                requiredModule.moduleName + " from " + queued.file.originalPath +
                                ":" + os.EOL + os.EOL +
                                "filename:    " + files[lowerIndex] + os.EOL +
                                "module name: " + requiredModule.filename + os.EOL +
                                "             " + arrows_1 + os.EOL);
                        }
                    }
                });
            }
        });
    };
    return DependencyWalker;
}());
exports.DependencyWalker = DependencyWalker;
