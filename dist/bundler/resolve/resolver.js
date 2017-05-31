"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var async = require("async");
var browserResolve = require("browser-resolve");
var os = require("os");
var path = require("path");
var PathTool = require("../../shared/path-tool");
var bundle_item_1 = require("../bundle-item");
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
    Resolver.prototype.resolveModule = function (requiringModule, bundleItem, buffer, onModuleResolved) {
        var _this = this;
        if (!bundleItem.moduleName) {
            this.log.error("Dependency required by %s has no module name", requiringModule);
        }
        bundleItem.lookupName = bundleItem.isNpmModule() ?
            bundleItem.moduleName :
            path.join(path.dirname(requiringModule), bundleItem.moduleName);
        if (this.lookupNameCache[bundleItem.lookupName]) {
            bundleItem.filename = this.lookupNameCache[bundleItem.lookupName];
            process.nextTick(function () {
                onModuleResolved(bundleItem);
            });
            return;
        }
        if (this.config.bundlerOptions.exclude.indexOf(bundleItem.moduleName) !== -1) {
            this.log.debug("Excluding module %s from %s", bundleItem.moduleName, requiringModule);
            process.nextTick(function () {
                onModuleResolved(bundleItem);
            });
            return;
        }
        var onFilenameResolved = function () {
            _this.lookupNameCache[bundleItem.lookupName] = bundleItem.filename;
            if (_this.isInFilenameCache(bundleItem) || bundleItem.isTypescriptFile()) {
                process.nextTick(function () {
                    onModuleResolved(bundleItem);
                });
            }
            else {
                _this.filenameCache.push(bundleItem.filename);
                _this.sourceReader.read(bundleItem, function () {
                    _this.resolveDependencies(bundleItem, buffer, onDependenciesResolved);
                });
            }
        };
        var onDependenciesResolved = function () {
            buffer.push(bundleItem);
            return onModuleResolved(bundleItem);
        };
        this.resolveFilename(requiringModule, bundleItem, onFilenameResolved);
    };
    Resolver.prototype.isInFilenameCache = function (bundleItem) {
        return this.filenameCache.indexOf(bundleItem.filename) !== -1;
    };
    Resolver.prototype.resolveFilename = function (requiringModule, bundleItem, onFilenameResolved) {
        var bopts = {
            extensions: this.config.bundlerOptions.resolve.extensions,
            filename: bundleItem.isNpmModule() ? undefined : requiringModule,
            moduleDirectory: this.config.bundlerOptions.resolve.directories,
            modules: this.shims,
            pathFilter: this.pathFilter.bind(this)
        };
        browserResolve(bundleItem.moduleName, bopts, function (error, filename) {
            if (error) {
                throw new Error("Unable to resolve module [" +
                    bundleItem.moduleName + "] from [" + requiringModule + "]" + os.EOL +
                    JSON.stringify(bopts, undefined, 2) + os.EOL +
                    error);
            }
            bundleItem.filename = filename;
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
    Resolver.prototype.resolveDependencies = function (bundleItem, buffer, onDependenciesResolved) {
        var _this = this;
        if (bundleItem.isScript() && this.dependencyWalker.hasRequire(bundleItem.source)) {
            this.dependencyWalker.collectJavascriptDependencies(bundleItem, function (moduleNames) {
                async.each(moduleNames, function (moduleName, onModuleResolved) {
                    var dependency = new bundle_item_1.BundleItem(moduleName);
                    _this.resolveModule(bundleItem.filename, dependency, buffer, function (resolved) {
                        if (resolved) {
                            bundleItem.dependencies.push(resolved);
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
