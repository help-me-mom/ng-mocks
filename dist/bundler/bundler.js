"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var async = require("async");
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
    function Bundler(config, dependencyWalker, globals, log, resolver, transformer, validator) {
        this.config = config;
        this.dependencyWalker = dependencyWalker;
        this.globals = globals;
        this.log = log;
        this.resolver = resolver;
        this.transformer = transformer;
        this.validator = validator;
        this.BUNDLE_DELAY = 500;
        this.bundleQueuedModulesDeferred = lodash.debounce(this.bundleQueuedModules, this.BUNDLE_DELAY);
        this.bundleBuffer = [];
        this.bundleFile = tmp.fileSync({
            postfix: ".js",
            prefix: "karma-typescript-bundle-"
        });
        this.bundleQueue = [];
        this.entrypoints = [];
        this.expandedFiles = [];
    }
    Bundler.prototype.initialize = function (moduleFormat) {
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
                    _this.resolver.resolveModule(queued.module.moduleName, requiredModule, _this.bundleBuffer, function () {
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
        this.globals.add(this.bundleBuffer, this.entrypoints, function () {
            _this.writeMainBundleFile(function () {
                _this.bundleQueue.forEach(function (queued) {
                    queued.callback(queued.module.source);
                });
            });
        });
    };
    Bundler.prototype.onAllResolved = function (benchmark) {
        var _this = this;
        this.orderEntrypoints();
        this.globals.add(this.bundleBuffer, this.entrypoints, function () {
            _this.writeMainBundleFile(function () {
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
        if (this.entrypoints.length > 0) {
            return "global.entrypointFilenames=['" + this.entrypoints.join("','") + "'];" + os.EOL;
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
        var orderedEntrypoints = [];
        this.expandedFiles.forEach(function (filename) {
            if (_this.entrypoints.indexOf(filename) !== -1) {
                orderedEntrypoints.push(filename);
            }
        });
        this.entrypoints = orderedEntrypoints;
    };
    Bundler.prototype.writeMainBundleFile = function (onMainBundleFileWritten) {
        var _this = this;
        var bundle = "(function(global){" + os.EOL +
            "global.wrappers={};" + os.EOL;
        this.bundleBuffer.forEach(function (requiredModule) {
            bundle += _this.addLoaderFunction(requiredModule, false);
        });
        bundle += this.createEntrypointFilenames() + "})(this);";
        fs.writeFile(this.bundleFile.name, bundle, function (error) {
            if (error) {
                throw error;
            }
            _this.validator.validate(bundle, _this.bundleFile.name);
            onMainBundleFileWritten();
        });
    };
    return Bundler;
}());
exports.Bundler = Bundler;
