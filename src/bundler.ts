import acorn = require("acorn");
import async = require("async");
import browserResolve = require("browser-resolve");
import fs = require("fs");
import glob = require("glob");
import lodash = require("lodash");
import os = require("os");
import path = require("path");
import tmp = require("tmp");

import { FilePattern } from "karma";
import { Logger } from "log4js";

import Benchmark = require("./benchmark");
import BundleCallback = require("./bundle-callback");
import Configuration = require("./configuration");
import EmitOutput = require("./emit-output");
import File = require("./file");
import PathTool = require("./path-tool");
import RequiredModule = require("./required-module");
import SourceMap = require("./source-map");

class Bundler {

    private readonly BUNDLE_DELAY = 500;

    private detective = require("detective");

    private bundleQueuedModulesDeferred = lodash.debounce(this.bundleQueuedModules, this.BUNDLE_DELAY);
    private bundleWithoutLoaderDeferred = lodash.debounce(this.bundleWithoutLoader, this.BUNDLE_DELAY);

    private builtins: any;
    private bundleBuffer = "";
    private bundleFile = tmp.fileSync({
        postfix: ".js",
        prefix: "karma-typescript-bundle-"
    });
    private bundleQueue: RequiredModule[] = [];
    private entrypoints: string[] = [];
    private expandedFiles: string[] = [];
    private filenameCache: string[] = [];
    private log: Logger;
    private lookupNameCache: { [key: string]: string; } = {};
    private orderedEntrypoints: string[] = [];

    constructor(private config: Configuration) { }

    public initialize(logger: any) {
        this.log = logger.create("bundler.karma-typescript");
        this.builtins = this.config.bundlerOptions.addNodeGlobals ?
            require("browserify/lib/builtins") : undefined;
    }

    public attach(files: FilePattern[]) {

        files.unshift({
            included: true,
            pattern: this.bundleFile.name,
            served: true,
            watched: true
        });

        files.push({
            included: true,
            pattern: path.join(__dirname, "../src/client/commonjs.js"),
            served: true,
            watched: false
        });

        this.expandPatterns(files);
    }

    public bundle(file: File, source: string, emitOutput: EmitOutput,
                  shouldAddLoader: boolean, callback: BundleCallback) {

        this.bundleQueue.push({
            callback,
            filename: file.originalPath,
            moduleName: file.path,
            requiredModules: emitOutput.requiredModules,
            source: SourceMap.create(file, source, emitOutput)
        });

        if (shouldAddLoader) {
            this.bundleQueuedModulesDeferred();
        }
        else {
            this.bundleWithoutLoaderDeferred();
        }
    }

    private expandPatterns(files: FilePattern[]) {

        files.forEach((file) => {

            let g = new glob.Glob(path.normalize(file.pattern), {
                cwd: "/",
                follow: true,
                nodir: true,
                sync: true
            });

            Array.prototype.push.apply(this.expandedFiles, g.found);
        });
    }

    private bundleQueuedModules() {

        let benchmark = new Benchmark();

        async.each(this.bundleQueue, (queued, onQueuedResolved) => {

            this.addEntrypointFilename(queued.filename);

            async.each(queued.requiredModules, (requiredModule, onRequiredModuleResolved) => {
                if (!requiredModule.isTypescriptFile &&
                    !(requiredModule.isTypingsFile && !this.isNpmModule(requiredModule.moduleName))) {
                    this.resolveModule(queued.moduleName, requiredModule, () => {
                        onRequiredModuleResolved();
                    });
                }
                else {
                    process.nextTick(() => {
                        onRequiredModuleResolved();
                    });
                }
            }, onQueuedResolved);
        }, () => {
            this.onAllResolved(benchmark);
        });
    }

    private bundleWithoutLoader() {
        this.createGlobals((globals) => {
            this.writeBundleFile(globals, () => {
                this.bundleQueue.forEach((queued) => {
                    queued.callback(queued.source);
                });
            });
        });
    }

    private onAllResolved(benchmark: Benchmark) {

        this.orderEntrypoints();

        this.createGlobals((globals) => {
            this.writeBundleFile(globals, () => {
                this.log.info("Bundled imports for %s file(s) in %s ms.",
                    this.bundleQueue.length, benchmark.elapsed());

                this.bundleQueue.forEach((queued) => {
                    queued.callback(this.addLoaderFunction(queued, true));
                });

                this.log.debug("Karma callbacks for %s file(s) in %s ms.",
                    this.bundleQueue.length, benchmark.elapsed());

                this.bundleQueue.length = 0;
            });
        });
    }

    private addLoaderFunction(module: RequiredModule, standalone: boolean): string {

        let requiredModuleMap: { [key: string]: string; } = {};
        let moduleId = path.relative(this.config.karma.basePath, module.filename);

        module.requiredModules.forEach((requiredModule) => {
            if (!requiredModule.filename) {
                this.log.debug("No resolved filename for module [%s], required by [%s]",
                    requiredModule.moduleName, module.filename);
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
    }

    private createEntrypointFilenames() {
        if (this.orderedEntrypoints.length > 0) {
            return "global.entrypointFilenames=['" + this.orderedEntrypoints.join("','") + "'];" + os.EOL;
        }
        return "";
    }

    private addEntrypointFilename(filename: string) {
        if (this.config.bundlerOptions.entrypoints.test(filename) &&
           this.entrypoints.indexOf(filename) === -1) {
            this.entrypoints.push(filename);
        }
    }

    private orderEntrypoints() {
        this.expandedFiles.forEach((filename) => {
            if (this.entrypoints.indexOf(filename) !== -1) {
                this.orderedEntrypoints.push(filename);
            }
        });
    }

    private writeBundleFile(globals: string, onBundleFileWritten: { (): void } ) {

        let bundle = "(function(global){" + os.EOL +
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

        fs.writeFile(this.bundleFile.name, bundle, (error) => {
            if (error) {
                throw error;
            }
            onBundleFileWritten();
        });
    }

    private createGlobals(onGlobalsCreated: { (globals: string): void }) {

        if (!this.config.bundlerOptions.addNodeGlobals) {
            process.nextTick(() => {
                onGlobalsCreated("");
            });
            return;
        }

        let globals = new RequiredModule(undefined, "globals.js",
            os.EOL + "global.process=require('process/browser');" +
            os.EOL + "global.Buffer=require('buffer/').Buffer;", [
                new RequiredModule("process/browser"),
                new RequiredModule("buffer/")
            ]);

        this.resolveModule(globals.filename, globals.requiredModules[0], () => {
            this.resolveModule(globals.filename, globals.requiredModules[1], () => {
                this.orderedEntrypoints.unshift(globals.filename);
                onGlobalsCreated(this.addLoaderFunction(globals, false) + os.EOL);
            });
        });
    }

    private resolveModule(requiringModule: string, requiredModule: RequiredModule,
                          onRequiredModuleResolved: { (requiredModule?: RequiredModule): void }) {

        requiredModule.lookupName = this.isNpmModule(requiredModule.moduleName) ?
                requiredModule.moduleName :
                path.join(path.dirname(requiringModule), requiredModule.moduleName);

        if (this.lookupNameCache[requiredModule.lookupName]) {
            requiredModule.filename = this.lookupNameCache[requiredModule.lookupName];
            process.nextTick(() => {
                onRequiredModuleResolved(requiredModule);
            });
            return;
        }

        if (this.config.bundlerOptions.exclude.indexOf(requiredModule.moduleName) !== -1) {
            this.log.debug("Excluding module %s from %s", requiredModule.moduleName, requiringModule);
            process.nextTick(() => {
                onRequiredModuleResolved();
            });
            return;
        }

        let onFilenameResolved = () => {

            this.lookupNameCache[requiredModule.lookupName] = requiredModule.filename;

            if (this.filenameCache.indexOf(requiredModule.filename) !== -1 ||
                requiredModule.filename.indexOf(".ts") !== -1) {
                process.nextTick(() => {
                    onRequiredModuleResolved(requiredModule);
                });
                return;
            }
            else {
                this.filenameCache.push(requiredModule.filename);
                this.readSource(requiredModule, onSourceRead);
            }
        };

        let onSourceRead = () => {

            if (!this.isScript(requiredModule.filename)) {
                if (this.isJson(requiredModule.filename)) {
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

            this.resolveDependencies(requiredModule, onDependenciesResolved);
        };

        let onDependenciesResolved = () => {
            this.bundleBuffer += this.addLoaderFunction(requiredModule, false);
            return onRequiredModuleResolved(requiredModule);
        };

        this.resolveFilename(requiringModule, requiredModule, onFilenameResolved);
    }

    private resolveFilename(requiringModule: string, requiredModule: RequiredModule, onFilenameResolved: { (): void }) {

        let bopts = {
            extensions: this.config.bundlerOptions.resolve.extensions,
            filename: this.isNpmModule(requiredModule.moduleName) ? undefined : requiringModule,
            moduleDirectory: this.config.bundlerOptions.resolve.directories,
            modules: this.builtins,
            pathFilter: this.pathFilter.bind(this)
        };

        browserResolve(requiredModule.moduleName, bopts, (error, filename) => {
            if (error) {
                throw new Error("Unable to resolve module [" +
                    requiredModule.moduleName + "] from [" + requiringModule + "]");
            }
            requiredModule.filename = filename;
            onFilenameResolved();
        });
    }

    private pathFilter(pkg: any, fullPath: string, relativePath: string): string {

        let filteredPath;
        let normalizedPath = PathTool.fixWindowsPath(fullPath);

        Object
            .keys(this.config.bundlerOptions.resolve.alias)
            .forEach((moduleName) => {
                let regex = new RegExp(moduleName);
                if (regex.test(normalizedPath) && pkg && relativePath) {
                    filteredPath = path.join(fullPath, this.config.bundlerOptions.resolve.alias[moduleName]);
                }
            });

        if (filteredPath) {
            return filteredPath;
        }
    }

    private readSource(requiredModule: RequiredModule, onSourceRead: { (source?: string): void }) {

        if (this.config.bundlerOptions.ignore.indexOf(requiredModule.moduleName) !== -1) {
            onSourceRead("module.exports={};");
        }
        else {
            fs.readFile(requiredModule.filename, (error, data) => {
                if (error) {
                    throw error;
                }
                requiredModule.source = SourceMap.deleteComment(data.toString());
                onSourceRead();
            });
        }
    }

    private resolveDependencies(requiredModule: RequiredModule, onDependenciesResolved: { (): void }) {

        requiredModule.requiredModules = [];

        if (this.isScript(requiredModule.filename) &&
           this.config.bundlerOptions.noParse.indexOf(requiredModule.moduleName) === -1) {

            let found = this.detective.find(requiredModule.source);
            let moduleNames: string[] = found.strings;

            this.addDynamicDependencies(found.expressions, moduleNames, requiredModule);

            async.each(moduleNames, (moduleName, onModuleResolved) => {
                let dependency = new RequiredModule(moduleName);
                this.resolveModule(requiredModule.filename, dependency, (resolved) => {
                    if (resolved) {
                        requiredModule.requiredModules.push(resolved);
                    }
                    onModuleResolved();
                });
            }, onDependenciesResolved);
        }
        else {
            process.nextTick(() => {
                onDependenciesResolved();
            });
        }
    }

    private addDynamicDependencies(expressions: string[], moduleNames: string[], requiredModule: RequiredModule) {

        expressions.forEach((expression) => {

            let dynamicModuleName = this.parseDynamicRequire(expression);
            let directory = path.dirname(requiredModule.filename);
            let pattern: string;
            let files: string[];

            if (dynamicModuleName && dynamicModuleName !== "*") {

                if (this.isNpmModule(dynamicModuleName)) {
                    moduleNames.push(dynamicModuleName);
                }
                else {

                    pattern = path.join(directory, dynamicModuleName);
                    files = glob.sync(pattern);

                    files.forEach((filename) => {
                        this.log.debug("Dynamic require: \nexpression: [%s]\nfilename: %s\nrequired by %s\nglob: %s",
                                 expression, filename, requiredModule.filename, pattern);
                        moduleNames.push("./" + path.relative(directory, filename));
                    });
                }
            }
        });
    }

    private parseDynamicRequire(requireStatement: string): string {

        let ast = acorn.parse(requireStatement);

        let visit = (node: any): string => {
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
    }

    private isNpmModule(moduleName: string) {
        return moduleName.charAt(0) !== "." &&
               moduleName.charAt(0) !== "/";
    }

    private isJson(resolvedModulePath: string) {
        return /\.json$/.test(resolvedModulePath);
    }

    private isScript(resolvedModulePath: string) {
        return /\.(js|jsx|ts|tsx)$/.test(resolvedModulePath);
    }
}

export = Bundler;
