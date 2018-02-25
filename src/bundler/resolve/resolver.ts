import * as async from "async";
import * as browserResolve from "browser-resolve";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";

import { Logger } from "log4js";

import { Configuration } from "../../shared/configuration";
import { BundleItem } from "../bundle-item";
import { DependencyWalker } from "../dependency-walker";
import { SourceReader } from "./source-reader";

import PathTool = require("../../shared/path-tool");

export class Resolver {

    private shims: any;
    private bowerPackages: { [key: string]: string; } = {};
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
        this.cacheBowerPackages();
    }

    public resolveModule(requiringModule: string,
                         bundleItem: BundleItem,
                         buffer: BundleItem[],
                         onModuleResolved: { (bundleItem: BundleItem): void }) {

        if (bundleItem.isTypescriptFile()) {
            process.nextTick(() => {
                onModuleResolved(bundleItem);
            });
            return;
        }

        if (bundleItem.isTypingsFile() && !bundleItem.isNpmModule()) {
            this.tryResolveTypingAsJavascript(bundleItem, onModuleResolved);
            return;
        }

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

    private tryResolveTypingAsJavascript(bundleItem: BundleItem,
                                         onModuleResolved: { (bundleItem: BundleItem): void }): void {
        let jsfile = bundleItem.filename.replace(/.d.ts$/i, ".js");
        fs.stat(jsfile, (error: Error, stats: fs.Stats) => {
            if (!error && stats) {
                this.log.debug("Resolving %s to %s", bundleItem.filename, jsfile);
                bundleItem.filename = jsfile;
            }
            onModuleResolved(bundleItem);
        });
    }

    private cacheBowerPackages(): void {
        try {
            let bower = require("bower");
            bower.commands
                .list({ map: true }, { offline: true })
                .on("end", (map: any) => {

                    Object.keys(map.dependencies).forEach((moduleName) => {

                        let pkg = map.dependencies[moduleName];
                        let files = ["index.js", moduleName + ".js"];

                        if (pkg.pkgMeta && pkg.pkgMeta.main) {
                            if (Array.isArray(pkg.pkgMeta.main)) {
                                pkg.pkgMeta.main.forEach((file: any) => {
                                    files.push(file);
                                });
                            }
                            else {
                                files.push(pkg.pkgMeta.main);
                            }
                        }

                        files.forEach((file) => {
                            try {
                                let main = path.join(pkg.canonicalDir, file);
                                fs.statSync(main);
                                this.bowerPackages[moduleName] = main;
                            }
                            catch (error) {
                                // noop
                            }
                        });
                    });
                    this.log.debug("Cached bower packages: %s %s", os.EOL, JSON.stringify(this.bowerPackages, null, 2));
                });
        }
        catch (error) {
            this.log.debug("No bower detected, skipping");
        }
    }

    private isInFilenameCache(bundleItem: BundleItem): boolean {
        return this.filenameCache.indexOf(bundleItem.filename) !== -1;
    }

    private resolveCompilerPathModulename(bundleItem: BundleItem): string {

        let moduleName = bundleItem.moduleName;

        if (bundleItem.isNpmModule() && bundleItem.isTypingsFile() &&
            bundleItem.filename.indexOf(bundleItem.moduleName) === -1) {

            let filename = PathTool.fixWindowsPath(bundleItem.filename);
            let matches = filename.match(/\/node_modules\/(.*)\//);

            if (matches && matches[1]) {
                moduleName = matches[1];
                this.log.debug("Resolved module name [%s] to [%s]", bundleItem.moduleName, moduleName);
            }
        }

        return moduleName;
    }

    private resolveFilename(requiringModule: string, bundleItem: BundleItem, onFilenameResolved: { (): void }) {

        const moduleName = this.resolveCompilerPathModulename(bundleItem);

        if (this.bowerPackages[moduleName]) {
            bundleItem.filename = this.bowerPackages[moduleName];
            this.log.debug("Resolved [%s] to bower package: %s", moduleName, bundleItem.filename);
            return onFilenameResolved();
        }

        if (this.config.bundlerOptions.resolve.alias[moduleName]) {
            let alias = this.config.bundlerOptions.resolve.alias[moduleName];
            let relativePath = path.relative(this.config.karma.basePath, alias);
            bundleItem.filename = path.join(this.config.karma.basePath, relativePath);
            this.log.debug("Resolved [%s] to alias: %s", moduleName, bundleItem.filename);
            return onFilenameResolved();
        }

        let bopts: browserResolve.AsyncOpts = {
            extensions: this.config.bundlerOptions.resolve.extensions,
            filename: requiringModule,
            moduleDirectory: this.config.bundlerOptions.resolve.directories,
            modules: this.shims
        };

        browserResolve(moduleName, bopts, (error, filename) => {
            if (!error) {
                bundleItem.filename = fs.realpathSync(filename);
                return onFilenameResolved();
            }
            bopts = {
                basedir: bundleItem.filename ? path.dirname(bundleItem.filename) : this.config.karma.basePath,
                extensions: this.config.bundlerOptions.resolve.extensions,
                moduleDirectory: this.config.bundlerOptions.resolve.directories,
                modules: this.shims
            };

            browserResolve(moduleName, bopts, (error2, filename2) => {
                if (error2) {
                    if (bundleItem.filename && !bundleItem.isTypingsFile()) {
                        // This is probably a compiler path module (.js)
                        return onFilenameResolved();
                    }
                    throw new Error("Unable to resolve module [" +
                        moduleName + "] from [" + requiringModule + "]" + os.EOL +
                        JSON.stringify(bopts, undefined, 2) + os.EOL +
                        error);
                }
                bundleItem.filename = fs.realpathSync(filename2);
                onFilenameResolved();
            });
        });
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
