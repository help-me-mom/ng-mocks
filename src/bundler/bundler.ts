import * as acorn from "acorn";
import * as async from "async";
import * as browserResolve from "browser-resolve";
import * as fs from "fs";
import * as glob from "glob";
import * as lodash from "lodash";
import * as os from "os";
import * as path from "path";
import * as tmp from "tmp";

import { FilePattern } from "karma";
import { Logger } from "log4js";

import { EmitOutput } from "../compiler/emit-output";
import { Benchmark } from "../shared/benchmark";
import { Configuration } from "../shared/configuration";
import { File } from "../shared/file";
import PathTool = require("../shared/path-tool");
import { BundleCallback } from "./bundle-callback";
import { DependencyWalker } from "./dependency-walker";
import { Queued } from "./queued";
import { RequiredModule } from "./required-module";
import SourceMap = require("./source-map");
import { Transformer } from "./transformer";
import { Validator } from "./validator";

export class Bundler {

    private readonly BUNDLE_DELAY = 500;

    private bundleQueuedModulesDeferred = lodash.debounce(this.bundleQueuedModules, this.BUNDLE_DELAY);

    private builtins: any;
    private bundleBuffer = "";
    private bundleFile = tmp.fileSync({
        postfix: ".js",
        prefix: "karma-typescript-bundle-"
    });
    private bundleQueue: Queued[] = [];
    private entrypoints: string[] = [];
    private expandedFiles: string[] = [];
    private filenameCache: string[] = [];
    private lookupNameCache: { [key: string]: string; } = {};
    private moduleFormat: string;
    private orderedEntrypoints: string[] = [];

    constructor(private config: Configuration,
                private dependencyWalker: DependencyWalker,
                private log: Logger,
                private transformer: Transformer,
                private validator: Validator) { }

    public initialize(moduleFormat: string) {
        this.builtins = this.config.bundlerOptions.addNodeGlobals ?
            require("browserify/lib/builtins") : undefined;
        this.moduleFormat = moduleFormat;
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
            pattern: path.join(__dirname, "../../src/client/commonjs.js"),
            served: true,
            watched: false
        });

        this.expandPatterns(files);
    }

    public bundle(file: File, emitOutput: EmitOutput, callback: BundleCallback) {
        this.bundleQueue.push({ callback, emitOutput, file });
        this.bundleQueuedModulesDeferred();
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

        this.transformer.applyTsTransforms(this.bundleQueue, () => {
            this.bundleQueue.forEach((queued) => {
                queued.module = new RequiredModule(queued.file.path, queued.file.originalPath,
                    SourceMap.create(queued.file, queued.emitOutput.sourceFile.text, queued.emitOutput));
            });

            if (this.shouldBundle()) {
                this.bundleWithLoader(benchmark);
            }
            else {
                this.bundleWithoutLoader();
            }
        });
    }

    private shouldBundle(): boolean {
        let requiredModuleCount = this.dependencyWalker.collectRequiredTsModules(this.bundleQueue);
        return requiredModuleCount > 0 &&
               this.moduleFormat.toLowerCase() === "commonjs" &&
               !this.config.hasPreprocessor("commonjs");
    }

    private bundleWithLoader(benchmark: Benchmark) {

        async.each(this.bundleQueue, (queued, onQueuedResolved) => {

            this.addEntrypointFilename(queued.module.filename);

            async.each(queued.module.requiredModules, (requiredModule, onRequiredModuleResolved) => {
                if (!requiredModule.isTypescriptFile() &&
                    !(requiredModule.isTypingsFile() && !requiredModule.isNpmModule())) {
                    this.resolveModule(queued.module.moduleName, requiredModule, () => {
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
                    queued.callback(queued.module.source);
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
                    queued.callback(this.addLoaderFunction(queued.module, true));
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

        fs.writeFile(this.bundleFile.name, bundle, (error) => {
            if (error) {
                throw error;
            }

            this.validator.validate(bundle, this.bundleFile.name);

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

        requiredModule.lookupName = requiredModule.isNpmModule() ?
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

            requiredModule.ast = acorn.parse(requiredModule.source, this.config.bundlerOptions.acornOptions);
            this.transformer.applyTransforms(requiredModule, (error: Error) => {
                if (error) {
                    throw Error;
                }
                this.resolveDependencies(requiredModule, onDependenciesResolved);
            });
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
            filename: requiredModule.isNpmModule() ? undefined : requiringModule,
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

        if (requiredModule.isScript() &&
            this.config.bundlerOptions.noParse.indexOf(requiredModule.moduleName) === -1 &&
            this.dependencyWalker.hasRequire(requiredModule.source)) {

            let moduleNames = this.dependencyWalker.collectRequiredJsModules(requiredModule);

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
}
