"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var acorn = require("acorn");
var async = require("async");
var browserResolve = require("browser-resolve");
var fs = require("fs");
var glob = require("glob");
var lodash = require("lodash");
var os = require("os");
var path = require("path");
var tmp = require("tmp");
var benchmark_1 = require("../shared/benchmark");
var PathTool = require("../shared/path-tool");
var required_module_1 = require("./required-module");
var SourceMap = require("./source-map");
var Bundler = (function () {
    function Bundler(config, dependencyWalker, log, transformer, validator) {
        this.config = config;
        this.dependencyWalker = dependencyWalker;
        this.log = log;
        this.transformer = transformer;
        this.validator = validator;
        this.BUNDLE_DELAY = 500;
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
    Bundler.prototype.initialize = function (moduleFormat) {
        this.builtins = this.config.bundlerOptions.addNodeGlobals ?
            require("browserify/lib/builtins") : undefined;
        this.moduleFormat = moduleFormat;
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
    Bundler.prototype.bundle = function (file, emitOutput, callback) {
        this.bundleQueue.push({ callback: callback, emitOutput: emitOutput, file: file });
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
        var _this = this;
        var benchmark = new benchmark_1.Benchmark();
        this.transformer.applyTsTransforms(this.bundleQueue, function () {
            _this.bundleQueue.forEach(function (queued) {
                queued.module = new required_module_1.RequiredModule(queued.file.path, queued.file.originalPath, SourceMap.create(queued.file, queued.emitOutput.sourceFile.text, queued.emitOutput));
            });
            if (_this.shouldBundle()) {
                _this.bundleWithLoader(benchmark);
            }
            else {
                _this.bundleWithoutLoader();
            }
        });
    };
    Bundler.prototype.shouldBundle = function () {
        var requiredModuleCount = this.dependencyWalker.collectRequiredTsModules(this.bundleQueue);
        return requiredModuleCount > 0 &&
            this.moduleFormat.toLowerCase() === "commonjs" &&
            !this.config.hasPreprocessor("commonjs");
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
        this.createGlobals(function (globals, constants) {
            _this.writeBundleFile(globals, constants, function () {
                _this.bundleQueue.forEach(function (queued) {
                    queued.callback(queued.module.source);
                });
            });
        });
    };
    Bundler.prototype.onAllResolved = function (benchmark) {
        var _this = this;
        this.orderEntrypoints();
        this.createGlobals(function (globals, constants) {
            _this.writeBundleFile(globals, constants, function () {
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
    Bundler.prototype.writeBundleFile = function (globals, constants, onBundleFileWritten) {
        var _this = this;
        var bundle = "(function(global){" + os.EOL +
            "global.wrappers={};" + os.EOL +
            globals + os.EOL +
            constants + os.EOL +
            this.bundleBuffer +
            this.createEntrypointFilenames() +
            "})(this);";
        fs.writeFile(this.bundleFile.name, bundle, function (error) {
            if (error) {
                throw error;
            }
            _this.validator.validate(bundle, _this.bundleFile.name);
            onBundleFileWritten();
        });
    };
    Bundler.prototype.createGlobals = function (onGlobalsCreated) {
        var _this = this;
        var constants = this.createConstants();
        if (!this.config.bundlerOptions.addNodeGlobals) {
            process.nextTick(function () {
                onGlobalsCreated("", constants);
            });
            return;
        }
        var globals = new required_module_1.RequiredModule(undefined, "globals.js", os.EOL + "global.process=require('process/browser');" +
            os.EOL + "global.Buffer=require('buffer/').Buffer;", [
            new required_module_1.RequiredModule("process/browser"),
            new required_module_1.RequiredModule("buffer/")
        ]);
        this.resolveModule(globals.filename, globals.requiredModules[0], function () {
            _this.resolveModule(globals.filename, globals.requiredModules[1], function () {
                _this.orderedEntrypoints.unshift(globals.filename);
                onGlobalsCreated(_this.addLoaderFunction(globals, false), constants);
            });
        });
    };
    Bundler.prototype.createConstants = function () {
        var _this = this;
        var source = "";
        Object.keys(this.config.bundlerOptions.constants).forEach(function (key) {
            var value = _this.config.bundlerOptions.constants[key];
            if (!lodash.isString(value)) {
                value = JSON.stringify(value);
            }
            source += os.EOL + "global." + key + "=" + value + ";";
        });
        var constants = new required_module_1.RequiredModule(undefined, "constants.js", source, []);
        this.orderedEntrypoints.unshift(constants.filename);
        return this.addLoaderFunction(constants, false);
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
                }
            }
            requiredModule.ast = acorn.parse(requiredModule.source, _this.config.bundlerOptions.acornOptions);
            _this.transformer.applyTransforms(requiredModule, function (error) {
                if (error) {
                    throw Error;
                }
                _this.resolveDependencies(requiredModule, onDependenciesResolved);
            });
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
            this.config.bundlerOptions.noParse.indexOf(requiredModule.moduleName) === -1 &&
            this.dependencyWalker.hasRequire(requiredModule.source)) {
            var moduleNames = this.dependencyWalker.collectRequiredJsModules(requiredModule);
            async.each(moduleNames, function (moduleName, onModuleResolved) {
                var dependency = new required_module_1.RequiredModule(moduleName);
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
    return Bundler;
}());
exports.Bundler = Bundler;
