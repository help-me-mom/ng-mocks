"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var acorn = require("acorn");
var async = require("async");
var browserResolve = require("browser-resolve");
var fs = require("fs");
var os = require("os");
var path = require("path");
var PathTool = require("../shared/path-tool");
var required_module_1 = require("./required-module");
var SourceMap = require("./source-map");
var Resolver = (function () {
    function Resolver(config, dependencyWalker, log, transformer) {
        this.config = config;
        this.dependencyWalker = dependencyWalker;
        this.log = log;
        this.transformer = transformer;
        this.filenameCache = [];
        this.lookupNameCache = {};
    }
    Resolver.prototype.initialize = function () {
        this.builtins = this.config.bundlerOptions.addNodeGlobals ?
            require("browserify/lib/builtins") : undefined;
    };
    Resolver.prototype.resolveModule = function (requiringModule, requiredModule, buffer, onRequiredModuleResolved) {
        var _this = this;
        requiredModule.lookupName = requiredModule.isNpmModule() ?
            requiredModule.moduleName :
            path.join(path.dirname(requiringModule), requiredModule.moduleName);
        if (this.lookupNameCache[requiredModule.lookupName]) {
            requiredModule.filename = this.lookupNameCache[requiredModule.lookupName];
            process.nextTick(function () {
                onRequiredModuleResolved(requiredModule);
            });
            return;
        }
        if (this.config.bundlerOptions.exclude.indexOf(requiredModule.moduleName) !== -1) {
            this.log.debug("Excluding module %s from %s", requiredModule.moduleName, requiringModule);
            process.nextTick(function () {
                onRequiredModuleResolved();
            });
            return;
        }
        var onFilenameResolved = function () {
            _this.lookupNameCache[requiredModule.lookupName] = requiredModule.filename;
            if (_this.filenameCache.indexOf(requiredModule.filename) !== -1 ||
                requiredModule.filename.indexOf(".ts") !== -1) {
                process.nextTick(function () {
                    onRequiredModuleResolved(requiredModule);
                });
                return;
            }
            else {
                _this.filenameCache.push(requiredModule.filename);
                _this.readSource(requiredModule, onSourceRead);
            }
        };
        var onSourceRead = function () {
            if (!requiredModule.isScript()) {
                if (requiredModule.isJson()) {
                    requiredModule.source = os.EOL +
                        "module.isJSON = true;" + os.EOL +
                        "module.exports = JSON.parse(" + JSON.stringify(requiredModule.source) + ");";
                }
                else {
                    requiredModule.source = os.EOL + "module.exports = " + JSON.stringify(requiredModule.source) + ";";
                }
            }
            requiredModule.ast = acorn.parse(requiredModule.source, _this.config.bundlerOptions.acornOptions);
            _this.transformer.applyTransforms(requiredModule, function (error) {
                if (error) {
                    throw Error;
                }
                _this.resolveDependencies(requiredModule, buffer, onDependenciesResolved);
            });
        };
        var onDependenciesResolved = function () {
            buffer.push(requiredModule);
            return onRequiredModuleResolved(requiredModule);
        };
        this.resolveFilename(requiringModule, requiredModule, onFilenameResolved);
    };
    Resolver.prototype.resolveFilename = function (requiringModule, requiredModule, onFilenameResolved) {
        var bopts = {
            extensions: this.config.bundlerOptions.resolve.extensions,
            filename: requiredModule.isNpmModule() ? undefined : requiringModule,
            moduleDirectory: this.config.bundlerOptions.resolve.directories,
            modules: this.builtins,
            pathFilter: this.pathFilter.bind(this)
        };
        browserResolve(requiredModule.moduleName, bopts, function (error, filename) {
            if (error) {
                throw new Error("Unable to resolve module [" +
                    requiredModule.moduleName + "] from [" + requiringModule + "]" + os.EOL +
                    JSON.stringify(bopts, undefined, 2) + os.EOL +
                    error);
            }
            requiredModule.filename = filename;
            onFilenameResolved();
        });
    };
    Resolver.prototype.pathFilter = function (pkg, fullPath, relativePath) {
        var _this = this;
        var filteredPath;
        var normalizedPath = PathTool.fixWindowsPath(fullPath);
        Object
            .keys(this.config.bundlerOptions.resolve.alias)
            .forEach(function (moduleName) {
            var regex = new RegExp(moduleName);
            if (regex.test(normalizedPath) && pkg && relativePath) {
                filteredPath = path.join(fullPath, _this.config.bundlerOptions.resolve.alias[moduleName]);
            }
        });
        if (filteredPath) {
            return filteredPath;
        }
    };
    Resolver.prototype.readSource = function (requiredModule, onSourceRead) {
        if (this.config.bundlerOptions.ignore.indexOf(requiredModule.moduleName) !== -1) {
            onSourceRead("module.exports={};");
        }
        else {
            fs.readFile(requiredModule.filename, function (error, data) {
                if (error) {
                    throw error;
                }
                requiredModule.source = SourceMap.deleteComment(data.toString());
                onSourceRead();
            });
        }
    };
    Resolver.prototype.resolveDependencies = function (requiredModule, buffer, onDependenciesResolved) {
        var _this = this;
        requiredModule.requiredModules = [];
        if (requiredModule.isScript() &&
            this.config.bundlerOptions.noParse.indexOf(requiredModule.moduleName) === -1 &&
            this.dependencyWalker.hasRequire(requiredModule.source)) {
            var moduleNames = this.dependencyWalker.collectRequiredJsModules(requiredModule);
            async.each(moduleNames, function (moduleName, onModuleResolved) {
                var dependency = new required_module_1.RequiredModule(moduleName);
                _this.resolveModule(requiredModule.filename, dependency, buffer, function (resolved) {
                    if (resolved) {
                        requiredModule.requiredModules.push(resolved);
                    }
                    onModuleResolved();
                });
            }, onDependenciesResolved);
        }
        else {
            process.nextTick(function () {
                onDependenciesResolved();
            });
        }
    };
    return Resolver;
}());
exports.Resolver = Resolver;
