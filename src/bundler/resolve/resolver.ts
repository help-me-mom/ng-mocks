import * as async from "async";
import * as browserResolve from "browser-resolve";
import * as os from "os";
import * as path from "path";

import { Logger } from "log4js";

import { Configuration } from "../../shared/configuration";
import { SourceReader } from "./source-reader";
import PathTool = require("../../shared/path-tool");
import { BundleItem } from "../bundle-item";
import { DependencyWalker } from "../dependency-walker";

export class Resolver {

    private shims: any;
    private filenameCache: string[] = [];
    private lookupNameCache: { [key: string]: string; } = {};

    constructor(private config: Configuration,
                private dependencyWalker: DependencyWalker,
                private log: Logger,
                private sourceReader: SourceReader) { }

    public initialize() {
        this.shims = this.config.bundlerOptions.addNodeGlobals ?
            require("./shims") : undefined;
        this.log.debug(this.shims);
    }

    public resolveModule(requiringModule: string,
                         bundleItem: BundleItem,
                         buffer: BundleItem[],
                         onModuleResolved: { (bundleItem: BundleItem): void }) {

        bundleItem.lookupName = bundleItem.isNpmModule() ?
                bundleItem.moduleName :
                path.join(path.dirname(requiringModule), bundleItem.moduleName);

        if (this.lookupNameCache[bundleItem.lookupName]) {
            bundleItem.filename = this.lookupNameCache[bundleItem.lookupName];
            process.nextTick(() => {
                onModuleResolved(bundleItem);
            });
            return;
        }

        if (this.config.bundlerOptions.exclude.indexOf(bundleItem.moduleName) !== -1) {
            this.log.debug("Excluding module %s from %s", bundleItem.moduleName, requiringModule);
            process.nextTick(() => {
                onModuleResolved(bundleItem);
            });
            return;
        }

        let onFilenameResolved = () => {

            this.lookupNameCache[bundleItem.lookupName] = bundleItem.filename;

            if (this.isInFilenameCache(bundleItem) || bundleItem.isTypescriptFile()) {
                process.nextTick(() => {
                    onModuleResolved(bundleItem);
                });
            }
            else {
                this.filenameCache.push(bundleItem.filename);
                this.sourceReader.read(bundleItem, () => {
                    this.resolveDependencies(bundleItem, buffer, onDependenciesResolved);
                });
            }
        };

        let onDependenciesResolved = () => {
            buffer.push(bundleItem);
            return onModuleResolved(bundleItem);
        };

        this.resolveFilename(requiringModule, bundleItem, onFilenameResolved);
    }

    private isInFilenameCache(bundleItem: BundleItem): boolean {
        return this.filenameCache.indexOf(bundleItem.filename) !== -1;
    }

    private resolveFilename(requiringModule: string, bundleItem: BundleItem, onFilenameResolved: { (): void }) {

        let bopts = {
            extensions: this.config.bundlerOptions.resolve.extensions,
            filename: bundleItem.isNpmModule() ? undefined : requiringModule,
            moduleDirectory: this.config.bundlerOptions.resolve.directories,
            modules: this.shims,
            pathFilter: this.pathFilter.bind(this)
        };

        browserResolve(bundleItem.moduleName, bopts, (error, filename) => {
            if (error) {
                throw new Error("Unable to resolve module [" +
                    bundleItem.moduleName + "] from [" + requiringModule + "]" + os.EOL +
                    JSON.stringify(bopts, undefined, 2) + os.EOL +
                    error);
            }
            bundleItem.filename = filename;
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

    private resolveDependencies(bundleItem: BundleItem,
                                buffer: BundleItem[],
                                onDependenciesResolved: { (): void }) {

        if (bundleItem.isScript() && this.dependencyWalker.hasRequire(bundleItem.source)) {
            this.dependencyWalker.collectJavascriptDependencies(bundleItem, (moduleNames) => {
                async.each(moduleNames, (moduleName, onModuleResolved) => {
                    let dependency = new BundleItem(moduleName);
                    this.resolveModule(bundleItem.filename, dependency, buffer, (resolved) => {
                        if (resolved) {
                            bundleItem.dependencies.push(resolved);
                        }
                        onModuleResolved();
                    });
                }, onDependenciesResolved);
            });
        }
        else {
            process.nextTick(() => {
                onDependenciesResolved();
            });
        }
    }
}
