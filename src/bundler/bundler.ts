import * as async from "async";
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
import { Globals } from "./globals";
import PathTool = require("../shared/path-tool");
import { BundleCallback } from "./bundle-callback";
import { DependencyWalker } from "./dependency-walker";
import { Queued } from "./queued";
import { RequiredModule } from "./required-module";
import { Resolver } from "./resolver";
import SourceMap = require("./source-map");
import { Transformer } from "./transformer";
import { Validator } from "./validator";

export class Bundler {

    private readonly BUNDLE_DELAY = 500;

    private bundleQueuedModulesDeferred = lodash.debounce(this.bundleQueuedModules, this.BUNDLE_DELAY);

    private bundleBuffer: RequiredModule[] = [];
    private bundleFile = tmp.fileSync({
        postfix: ".js",
        prefix: "karma-typescript-bundle-"
    });
    private bundleQueue: Queued[] = [];
    private entrypoints: string[] = [];
    private expandedFiles: string[] = [];
    private moduleFormat: string;

    constructor(private config: Configuration,
                private dependencyWalker: DependencyWalker,
                private globals: Globals,
                private log: Logger,
                private resolver: Resolver,
                private transformer: Transformer,
                private validator: Validator) { }

    public initialize(moduleFormat: string) {
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
                    this.resolver.resolveModule(queued.module.moduleName, requiredModule, this.bundleBuffer, () => {
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
        this.globals.add(this.bundleBuffer, this.entrypoints, () => {
            this.writeMainBundleFile(() => {
                this.bundleQueue.forEach((queued) => {
                    queued.callback(queued.module.source);
                });
            });
        });
    }

    private onAllResolved(benchmark: Benchmark) {

        this.orderEntrypoints();

        this.globals.add(this.bundleBuffer, this.entrypoints, () => {
            this.writeMainBundleFile(() => {
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
        if (this.entrypoints.length > 0) {
            return "global.entrypointFilenames=['" + this.entrypoints.join("','") + "'];" + os.EOL;
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
        let orderedEntrypoints: string[] = [];
        this.expandedFiles.forEach((filename) => {
            if (this.entrypoints.indexOf(filename) !== -1) {
                orderedEntrypoints.push(filename);
            }
        });
        this.entrypoints = orderedEntrypoints;
    }

    private writeMainBundleFile(onMainBundleFileWritten: { (): void } ) {

        let bundle = "(function(global){" + os.EOL +
                    "global.wrappers={};" + os.EOL;

        this.bundleBuffer.forEach((requiredModule) => {
            bundle += this.addLoaderFunction(requiredModule, false);
        });

        bundle += this.createEntrypointFilenames() + "})(this);";

        fs.writeFile(this.bundleFile.name, bundle, (error) => {
            if (error) {
                throw error;
            }
            this.validator.validate(bundle, this.bundleFile.name);
            onMainBundleFileWritten();
        });
    }
}
