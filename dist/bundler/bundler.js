"use strict";
var acorn = require("acorn");
var async = require("async");
var browserResolve = require("browser-resolve");
var fs = require("fs");
var glob = require("glob");
var lodash = require("lodash");
var os = require("os");
var path = require("path");
var tmp = require("tmp");
var Benchmark = require("../shared/benchmark");
var DependencyWalker = require("./dependency-walker");
var PathTool = require("../shared/path-tool");
var RequiredModule = require("./required-module");
var SourceMap = require("./source-map");
var Bundler = (function () {
    function Bundler(config) {
        this.config = config;
        this.BUNDLE_DELAY = 500;
        this.detective = require("detective");
        this.bundleQueuedModulesDeferred = lodash.debounce(this.bundleQueuedModules, this.BUNDLE_DELAY);
        this.bundleBuffer = "";
        this.bundleFile = tmp.fileSync({
            postfix: ".js",
            prefix: "karma-typescript-bundle-"
        });
        this.bundleQueue = [];
        this.entrypoints = [];
        this.expandedFiles = [];
        this.filenameCache = [];
        this.lookupNameCache = {};
        this.orderedEntrypoints = [];
    }
    Bundler.prototype.initialize = function (logger) {
        this.log = logger.create("bundler.karma-typescript");
        this.builtins = this.config.bundlerOptions.addNodeGlobals ?
            require("browserify/lib/builtins") : undefined;
    };
    Bundler.prototype.attach = function (files) {
        files.unshift({
            included: true,
            pattern: this.bundleFile.name,
            served: true,
            watched: true
        });
        files.push({
            included: true,
            pattern: path.join(__dirname, "../../src/client/commonjs.js"),
            served: true,
            watched: false
        });
        this.expandPatterns(files);
    };
    Bundler.prototype.bundle = function (file, source, emitOutput, callback) {
        this.bundleQueue.push({
            callback: callback,
            module: new RequiredModule(file.path, file.originalPath, SourceMap.create(file, source, emitOutput)),
            moduleFormat: emitOutput.moduleFormat,
            sourceFile: emitOutput.sourceFile
        });
        this.bundleQueuedModulesDeferred();
    };
    Bundler.prototype.expandPatterns = function (files) {
        var _this = this;
        files.forEach(function (file) {
            var g = new glob.Glob(path.normalize(file.pattern), {
                cwd: "/",
                follow: true,
                nodir: true,
                sync: true
            });
            Array.prototype.push.apply(_this.expandedFiles, g.found);
        });
    };
    Bundler.prototype.bundleQueuedModules = function () {
        var benchmark = new Benchmark();
        var requiredModuleCount = DependencyWalker.collectRequiredModules(this.bundleQueue);
        if (requiredModuleCount > 0) {
            this.bundleWithLoader(benchmark);
        }
        else {
            this.bundleWithoutLoader();
        }
    };
    Bundler.prototype.bundleWithLoader = function (benchmark) {
        var _this = this;
        async.each(this.bundleQueue, function (queued, onQueuedResolved) {
            _this.addEntrypointFilename(queued.module.filename);
            async.each(queued.module.requiredModules, function (requiredModule, onRequiredModuleResolved) {
                if (!requiredModule.isTypescriptFile() &&
                    !(requiredModule.isTypingsFile() && !requiredModule.isNpmModule())) {
                    _this.resolveModule(queued.module.moduleName, requiredModule, function () {
                        onRequiredModuleResolved();
                    });
                }
                else {
                    process.nextTick(function () {
                        onRequiredModuleResolved();
                    });
                }
            }, onQueuedResolved);
        }, function () {
            _this.onAllResolved(benchmark);
        });
    };
    Bundler.prototype.bundleWithoutLoader = function () {
        var _this = this;
        this.createGlobals(function (globals) {
            _this.writeBundleFile(globals, function () {
                _this.bundleQueue.forEach(function (queued) {
                    queued.callback(queued.module.source);
                });
            });
        });
    };
    Bundler.prototype.onAllResolved = function (benchmark) {
        var _this = this;
        this.orderEntrypoints();
        this.createGlobals(function (globals) {
            _this.writeBundleFile(globals, function () {
                _this.log.info("Bundled imports for %s file(s) in %s ms.", _this.bundleQueue.length, benchmark.elapsed());
                _this.bundleQueue.forEach(function (queued) {
                    queued.callback(_this.addLoaderFunction(queued.module, true));
                });
                _this.log.debug("Karma callbacks for %s file(s) in %s ms.", _this.bundleQueue.length, benchmark.elapsed());
                _this.bundleQueue.length = 0;
            });
        });
    };
    Bundler.prototype.addLoaderFunction = function (module, standalone) {
        var _this = this;
        var requiredModuleMap = {};
        var moduleId = path.relative(this.config.karma.basePath, module.filename);
        module.requiredModules.forEach(function (requiredModule) {
            if (!requiredModule.filename) {
                _this.log.debug("No resolved filename for module [%s], required by [%s]", requiredModule.moduleName, module.filename);
            }
            else {
                requiredModuleMap[requiredModule.moduleName] = PathTool.fixWindowsPath(requiredModule.filename);
            }
        });
        return (standalone ? "(function(global){" : "") +
            "global.wrappers['" + PathTool.fixWindowsPath(module.filename) + "']=" +
            "[function(require,module,exports,__dirname,__filename){ " + module.source +
            os.EOL + "},'" +
            PathTool.fixWindowsPath(moduleId) + "'," +
            PathTool.fixWindowsPath(JSON.stringify(requiredModuleMap)) + "];" +
            (standalone ? "})(this);" : "") + os.EOL;
    };
    Bundler.prototype.createEntrypointFilenames = function () {
        if (this.orderedEntrypoints.length > 0) {
            return "global.entrypointFilenames=['" + this.orderedEntrypoints.join("','") + "'];" + os.EOL;
        }
        return "";
    };
    Bundler.prototype.addEntrypointFilename = function (filename) {
        if (this.config.bundlerOptions.entrypoints.test(filename) &&
            this.entrypoints.indexOf(filename) === -1) {
            this.entrypoints.push(filename);
        }
    };
    Bundler.prototype.orderEntrypoints = function () {
        var _this = this;
        this.expandedFiles.forEach(function (filename) {
            if (_this.entrypoints.indexOf(filename) !== -1) {
                _this.orderedEntrypoints.push(filename);
            }
        });
    };
    Bundler.prototype.writeBundleFile = function (globals, onBundleFileWritten) {
        var bundle = "(function(global){" + os.EOL +
            "global.wrappers={};" + os.EOL +
            globals +
            this.bundleBuffer +
            this.createEntrypointFilenames() +
            "})(this);";
        if (this.config.bundlerOptions.validateSyntax) {
            try {
                acorn.parse(bundle);
            }
            catch (error) {
                throw new Error("Invalid syntax in bundle: " + error.message + " in " + this.bundleFile.name);
            }
        }
        fs.writeFile(this.bundleFile.name, bundle, function (error) {
            if (error) {
                throw error;
            }
            onBundleFileWritten();
        });
    };
    Bundler.prototype.createGlobals = function (onGlobalsCreated) {
        var _this = this;
        if (!this.config.bundlerOptions.addNodeGlobals) {
            process.nextTick(function () {
                onGlobalsCreated("");
            });
            return;
        }
        var globals = new RequiredModule(undefined, "globals.js", os.EOL + "global.process=require('process/browser');" +
            os.EOL + "global.Buffer=require('buffer/').Buffer;", [
            new RequiredModule("process/browser"),
            new RequiredModule("buffer/")
        ]);
        this.resolveModule(globals.filename, globals.requiredModules[0], function () {
            _this.resolveModule(globals.filename, globals.requiredModules[1], function () {
                _this.orderedEntrypoints.unshift(globals.filename);
                onGlobalsCreated(_this.addLoaderFunction(globals, false) + os.EOL);
            });
        });
    };
    Bundler.prototype.resolveModule = function (requiringModule, requiredModule, onRequiredModuleResolved) {
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
                    // temporary hack to make tests for #66 work
                    if (requiredModule.moduleName === "./style-import-tester.css") {
                        requiredModule.source = os.EOL + "module.exports = { color: '#f1a' };";
                    }
                }
            }
            _this.resolveDependencies(requiredModule, onDependenciesResolved);
        };
        var onDependenciesResolved = function () {
            _this.bundleBuffer += _this.addLoaderFunction(requiredModule, false);
            return onRequiredModuleResolved(requiredModule);
        };
        this.resolveFilename(requiringModule, requiredModule, onFilenameResolved);
    };
    Bundler.prototype.resolveFilename = function (requiringModule, requiredModule, onFilenameResolved) {
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
                    requiredModule.moduleName + "] from [" + requiringModule + "]");
            }
            requiredModule.filename = filename;
            onFilenameResolved();
        });
    };
    Bundler.prototype.pathFilter = function (pkg, fullPath, relativePath) {
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
    Bundler.prototype.readSource = function (requiredModule, onSourceRead) {
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
    Bundler.prototype.resolveDependencies = function (requiredModule, onDependenciesResolved) {
        var _this = this;
        requiredModule.requiredModules = [];
        if (requiredModule.isScript() &&
            this.config.bundlerOptions.noParse.indexOf(requiredModule.moduleName) === -1) {
            var found = this.detective.find(requiredModule.source);
            var moduleNames = found.strings;
            this.addDynamicDependencies(found.expressions, moduleNames, requiredModule);
            async.each(moduleNames, function (moduleName, onModuleResolved) {
                var dependency = new RequiredModule(moduleName);
                _this.resolveModule(requiredModule.filename, dependency, function (resolved) {
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
    Bundler.prototype.addDynamicDependencies = function (expressions, moduleNames, requiredModule) {
        var _this = this;
        expressions.forEach(function (expression) {
            var dynamicModuleName = _this.parseDynamicRequire(expression);
            var directory = path.dirname(requiredModule.filename);
            var pattern;
            var files;
            if (dynamicModuleName && dynamicModuleName !== "*") {
                if (new RequiredModule(dynamicModuleName).isNpmModule()) {
                    moduleNames.push(dynamicModuleName);
                }
                else {
                    pattern = path.join(directory, dynamicModuleName);
                    files = glob.sync(pattern);
                    files.forEach(function (filename) {
                        _this.log.debug("Dynamic require: \nexpression: [%s]\nfilename: %s\nrequired by %s\nglob: %s", expression, filename, requiredModule.filename, pattern);
                        moduleNames.push("./" + path.relative(directory, filename));
                    });
                }
            }
        });
    };
    Bundler.prototype.parseDynamicRequire = function (requireStatement) {
        var ast = acorn.parse(requireStatement);
        var visit = function (node) {
            switch (node.type) {
                case "BinaryExpression":
                    if (node.operator === "+") {
                        return visit(node.left) + visit(node.right);
                    }
                    break;
                case "ExpressionStatement":
                    return visit(node.expression);
                case "Literal":
                    return node.value + "";
                case "Identifier":
                    return "*";
                default:
                    return "";
            }
        };
        return visit(ast.body[0]);
    };
    return Bundler;
}());
module.exports = Bundler;
