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

    public initialize() : void {
        this.shims = this.config.bundlerOptions.addNodeGlobals ?
            require("./shims") : undefined;
        this.log.debug(this.shims);
        this.cacheBowerPackages();
    }

    public resolveModule(requiringModule: string,
                         bundleItem: BundleItem,
                         buffer: BundleItem[],
                         onModuleResolved: (bundleItem: BundleItem) => void) : void {

        if (bundleItem.isTypescriptFile() && !bundleItem.isNpmModule()) {
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

        const onFilenameResolved = () => {

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

        const onDependenciesResolved = () => {
            buffer.push(bundleItem);
            return onModuleResolved(bundleItem);
        };

        this.resolveFilename(requiringModule, bundleItem, onFilenameResolved);
    }

    private tryResolveTypingAsJavascript(bundleItem: BundleItem,
                                         onModuleResolved: (bundleItem: BundleItem) => void): void {
        const jsfile = bundleItem.filename.replace(/.d.ts$/i, ".js");
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
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const bower = require("bower");
            bower.commands
                .list({ map: true }, { offline: true })
                .on("end", (map: any) => {

                    Object.keys(map.dependencies).forEach((moduleName) => {

                        const pkg = map.dependencies[moduleName];
                        const files = ["index.js", moduleName + ".js"];

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
                                const main = path.join(pkg.canonicalDir, file);
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

    private resolveFilename(requiringModule: string, bundleItem: BundleItem, onFilenameResolved: () => void) {

        let moduleName = bundleItem.moduleName;

        if (this.bowerPackages[moduleName]) {
            bundleItem.filename = this.bowerPackages[moduleName];
            this.log.debug("Resolved [%s] to bower package: %s", moduleName, bundleItem.filename);
            return onFilenameResolved();
        }

        if (this.config.bundlerOptions.resolve.alias[moduleName]) {
            const alias = this.config.bundlerOptions.resolve.alias[moduleName];
            const relativePath = path.relative(this.config.karma.basePath, alias);
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

            // This is probably a compiler path module
            if(bundleItem.filename && !bundleItem.isTypingsFile() && (
                bundleItem.filename.endsWith(".js") ||
                bundleItem.filename.endsWith(".jsx") ||
                bundleItem.filename.endsWith(".ts") ||
                bundleItem.filename.endsWith(".tsx"))
            ) {
                return onFilenameResolved();
            }

            
            if (bundleItem.isNpmModule() && bundleItem.isTypingsFile()) {
                // This is probably a compiler path module (.d.ts)
                if (bundleItem.filename.indexOf(bundleItem.moduleName) === -1) {
                  const filepath = PathTool.fixWindowsPath(bundleItem.filename);
                  const matches = filepath.match(/\/node_modules\/(.*)\//);
                  if (matches && matches[1]) {
                      moduleName = matches[1];
                      this.log.debug("Resolved module name [%s] to [%s]", bundleItem.moduleName, moduleName);
                  }
                }
                // This is probably a type only module import
                else {
                  return onFilenameResolved()
                }
            }

            bopts = {
                basedir: bundleItem.filename ? path.dirname(bundleItem.filename) : this.config.karma.basePath,
                extensions: this.config.bundlerOptions.resolve.extensions,
                moduleDirectory: this.config.bundlerOptions.resolve.directories,
                modules: this.shims
            };

            browserResolve(moduleName, bopts, (error2: any, filename2: fs.PathLike) => {
                if (error2) {
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
                                onDependenciesResolved: () => void) {

        if (bundleItem.isScript() && this.dependencyWalker.hasRequire(bundleItem.source)) {
            this.dependencyWalker.collectJavascriptDependencies(bundleItem, (moduleNames) => {
                async.each(moduleNames, (moduleName: string, onModuleResolved: () => void) => {
                    const dependency = new BundleItem(moduleName);
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
