"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var async = require("async");
var browserResolve = require("browser-resolve");
var os = require("os");
var path = require("path");
var PathTool = require("../../shared/path-tool");
var required_module_1 = require("../required-module");
var Resolver = (function () {
    function Resolver(config, dependencyWalker, log, sourceReader) {
        this.config = config;
        this.dependencyWalker = dependencyWalker;
        this.log = log;
        this.sourceReader = sourceReader;
        this.filenameCache = [];
        this.lookupNameCache = {};
    }
    Resolver.prototype.initialize = function () {
        this.shims = this.config.bundlerOptions.addNodeGlobals ?
            require("./shims") : undefined;
        this.log.debug(this.shims);
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
                onRequiredModuleResolved(requiredModule);
            });
            return;
        }
        var onFilenameResolved = function () {
            _this.lookupNameCache[requiredModule.lookupName] = requiredModule.filename;
            if (_this.isInFilenameCache(requiredModule) || requiredModule.isTypescriptFile()) {
                process.nextTick(function () {
                    onRequiredModuleResolved(requiredModule);
                });
            }
            else {
                _this.filenameCache.push(requiredModule.filename);
                _this.sourceReader.read(requiredModule, function () {
                    _this.resolveDependencies(requiredModule, buffer, onDependenciesResolved);
                });
            }
        };
        var onDependenciesResolved = function () {
            buffer.push(requiredModule);
            return onRequiredModuleResolved(requiredModule);
        };
        this.resolveFilename(requiringModule, requiredModule, onFilenameResolved);
    };
    Resolver.prototype.isInFilenameCache = function (requiredModule) {
        return this.filenameCache.indexOf(requiredModule.filename) !== -1;
    };
    Resolver.prototype.resolveFilename = function (requiringModule, requiredModule, onFilenameResolved) {
        var bopts = {
            extensions: this.config.bundlerOptions.resolve.extensions,
            filename: requiredModule.isNpmModule() ? undefined : requiringModule,
            moduleDirectory: this.config.bundlerOptions.resolve.directories,
            modules: this.shims,
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
    Resolver.prototype.resolveDependencies = function (requiredModule, buffer, onDependenciesResolved) {
        var _this = this;
        if (requiredModule.isScript() && this.dependencyWalker.hasRequire(requiredModule.source)) {
            this.dependencyWalker.collectRequiredJsModules(requiredModule, function (moduleNames) {
                async.each(moduleNames, function (moduleName, onModuleResolved) {
                    var dependency = new required_module_1.RequiredModule(moduleName);
                    _this.resolveModule(requiredModule.filename, dependency, buffer, function (resolved) {
                        if (resolved) {
                            requiredModule.requiredModules.push(resolved);
                        }
                        onModuleResolved();
                    });
                }, onDependenciesResolved);
            });
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
