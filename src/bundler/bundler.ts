import * as async from "async";
import * as combineSourceMap from "combine-source-map";
import * as convertSourceMap from "convert-source-map";
import * as fs from "fs";
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
import { Project } from "../shared/project";
import { Globals } from "./globals";
import PathTool = require("../shared/path-tool");
import { BundleCallback } from "./bundle-callback";
import { BundleItem } from "./bundle-item";
import { DependencyWalker } from "./dependency-walker";
import { Queued } from "./queued";
import { Resolver } from "./resolve/resolver";
import { Transformer } from "./transformer";
import { Validator } from "./validator";

export class Bundler {

    private readonly BUNDLE_DELAY = 500;

    private bundleQueuedModulesDeferred = lodash.debounce(this.bundleQueuedModules, this.BUNDLE_DELAY);

    private bundleBuffer: BundleItem[] = [];
    private bundleFile = tmp.fileSync({
        postfix: ".js",
        prefix: "karma-typescript-bundle-"
    });
    private bundleQueue: Queued[] = [];
    private entrypoints: string[] = [];
    private projectImportCountOnFirstRun: number = undefined;

    constructor(private config: Configuration,
                private dependencyWalker: DependencyWalker,
                private globals: Globals,
                private log: Logger,
                private project: Project,
                private resolver: Resolver,
                private transformer: Transformer,
                private validator: Validator) { }

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
    }

    public bundle(file: File, emitOutput: EmitOutput, callback: BundleCallback) {
        this.bundleQueue.push({ callback, emitOutput, file });
        this.bundleQueuedModulesDeferred();
    }

    private bundleQueuedModules() {

        let benchmark = new Benchmark();

        this.transformer.applyTsTransforms(this.bundleQueue, () => {
            this.bundleQueue.forEach((queued) => {
                queued.item = new BundleItem(
                    queued.file.path, queued.file.originalPath, this.createInlineSourceMap(queued));
            });

            let dependencyCount = this.dependencyWalker.collectTypescriptDependencies(this.bundleQueue);

            if (this.shouldBundle(dependencyCount)) {
                this.bundleWithLoader(benchmark);
            }
            else {
                this.bundleWithoutLoader();
            }
        });
    }

    private createInlineSourceMap(queued: Queued): string {
        let inlined = queued.emitOutput.outputText;
        if (queued.emitOutput.sourceMapText) {

            let map = convertSourceMap
                .fromJSON(queued.emitOutput.sourceMapText)
                .addProperty("sourcesContent", [queued.emitOutput.sourceFile.text]);
            inlined = convertSourceMap.removeMapFileComments(queued.emitOutput.outputText) + map.toComment();

            // used by Karma to log errors with original source code line numbers
            queued.file.sourceMap = map.toObject();
        }
        return inlined;
    }

    private shouldBundle(dependencyCount: number): boolean {
        if (this.config.hasPreprocessor("commonjs")) {
            this.log.debug("Preprocessor 'commonjs' detected, code will NOT be bundled");
            return false;
        }
        if (!this.project.hasCompatibleModuleKind()) {
            this.log.debug("Module kind set to '%s', code will NOT be bundled", this.project.getModuleKind());
            return false;
        }
        if (this.projectImportCountOnFirstRun === undefined) {
            this.projectImportCountOnFirstRun = dependencyCount;
        }
        this.log.debug("Project has %s import/require statements, code will be%sbundled",
            this.projectImportCountOnFirstRun, this.projectImportCountOnFirstRun > 0 ? " " : " NOT ");
        return this.projectImportCountOnFirstRun > 0;
    }

    private bundleWithLoader(benchmark: Benchmark) {

        async.each(this.bundleQueue, (queued, onQueuedResolved) => {

            this.addEntrypointFilename(queued.item.filename);

            async.each(queued.item.dependencies, (bundleItem, onDependencyResolved) => {
                if (!bundleItem.isTypescriptFile() &&
                    !(bundleItem.isTypingsFile() && !bundleItem.isNpmModule())) {
                    this.resolver.resolveModule(queued.item.moduleName, bundleItem, this.bundleBuffer, () => {
                        onDependencyResolved();
                    });
                }
                else {
                    process.nextTick(() => {
                        onDependencyResolved();
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
                    queued.callback(queued.item.source);
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
                    queued.callback(this.addLoaderFunction(queued.item, true));
                });

                this.log.debug("Karma callbacks for %s file(s) in %s ms.",
                    this.bundleQueue.length, benchmark.elapsed());

                this.bundleQueue.length = 0;
            });
        });
    }

    private addLoaderFunction(bundleItem: BundleItem, standalone: boolean): string {

        let dependencyMap: { [key: string]: string; } = {};
        let moduleId = path.relative(this.config.karma.basePath, bundleItem.filename);

        bundleItem.dependencies.forEach((dependency) => {
            if (!dependency.filename) {
                this.log.debug("No resolved filename for module [%s], required by [%s]",
                    dependency.moduleName, bundleItem.filename);
            }
            else {
                dependencyMap[dependency.moduleName] = PathTool.fixWindowsPath(dependency.filename);
            }
        });

        return (standalone ? "(function(global){" : "") +
            "global.wrappers['" + PathTool.fixWindowsPath(bundleItem.filename) + "']=" +
            "[function(require,module,exports,__dirname,__filename){ " + bundleItem.source +
            os.EOL + "},'" +
            PathTool.fixWindowsPath(moduleId) + "'," +
            PathTool.fixWindowsPath(JSON.stringify(dependencyMap)) + "];" +
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
        this.project.getKarmaFiles().forEach((filename) => {
            if (this.entrypoints.indexOf(filename) !== -1) {
                orderedEntrypoints.push(filename);
            }
        });
        this.entrypoints = orderedEntrypoints;
    }

    private writeMainBundleFile(onMainBundleFileWritten: { (): void } ) {

        let bundle = "(function(global){" + os.EOL + "global.wrappers={};" + os.EOL;
        let sourcemap = combineSourceMap.create();
        let line = this.getNumberOfNewlines(bundle);

        this.bundleBuffer.forEach((bundleItem) => {

            if (this.config.bundlerOptions.sourceMap) {
                let sourceFile = path.relative(this.config.karma.basePath, bundleItem.filename);
                sourcemap.addFile(
                    { sourceFile: path.join("/base", sourceFile), source: bundleItem.source },
                    { line }
                );
            }

            let wrapped = this.addLoaderFunction(bundleItem, false);
            bundle += wrapped;
            if (this.config.bundlerOptions.sourceMap) {
                line += this.getNumberOfNewlines(wrapped);
            }
        });

        bundle += this.createEntrypointFilenames() + "})(this);" + os.EOL;
        if (this.config.bundlerOptions.sourceMap) {
            bundle += sourcemap.comment();
        }

        fs.writeFile(this.bundleFile.name, bundle, (error) => {
            if (error) {
                throw error;
            }
            this.validator.validate(bundle, this.bundleFile.name);
            onMainBundleFileWritten();
        });
    }

    private getNumberOfNewlines(source: any) {
        let newlines = source.match(/\n/g);
        return newlines ? newlines.length : 0;
    }
}
