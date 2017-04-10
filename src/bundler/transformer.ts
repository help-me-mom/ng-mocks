import * as async from "async";
import * as os from "os";
import * as ts from "typescript";

import { Logger } from "log4js";

import { Transform, TransformContext } from "../api";
import { Configuration } from "../shared/configuration";
import { Project } from "../shared/project";
import { BundleItem } from "./bundle-item";
import { Queued } from "./queued";

export class Transformer {

    constructor(private config: Configuration, private log: Logger, private project: Project) { }

    public applyTsTransforms(bundleQueue: Queued[], onTransformsApplied: { (): void }): void {

        let transforms = this.config.bundlerOptions.transforms;

        if (!transforms.length) {
            process.nextTick(() => {
                onTransformsApplied();
            });
            return;
        }

        async.eachSeries(bundleQueue, (queued: Queued, onQueueProcessed: ErrorCallback<Error>) => {

            let context: TransformContext = {
                config: this.config,
                filename: queued.file.originalPath,
                module: queued.file.originalPath,
                source: queued.emitOutput.sourceFile.getFullText(),
                ts: {
                    ast: queued.emitOutput.sourceFile,
                    version: ts.version
                }
            };
            async.eachSeries(transforms, (transform: Transform, onTransformApplied: ErrorCallback<Error>) => {
                process.nextTick(() => {
                    transform(context, (error: Error, dirty: boolean) => {
                        this.handleError(error, transform);
                        if (dirty) {
                            let transpiled = ts.transpileModule(context.source, {
                                compilerOptions: this.project.getTsconfig().options,
                                fileName: context.filename
                            });
                            queued.emitOutput.outputText = transpiled.outputText;
                            queued.emitOutput.sourceMapText = transpiled.sourceMapText;
                        }
                        onTransformApplied();
                    });
                });
            }, onQueueProcessed);
        }, onTransformsApplied);
    }

    public applyTransforms(bundleItem: BundleItem, onTransformsApplied: { (): void }): void {

        let transforms = this.config.bundlerOptions.transforms;

        if (!transforms.length) {
            process.nextTick(() => {
                onTransformsApplied();
            });
            return;
        }

        let context: TransformContext = {
            config: this.config,
            filename: bundleItem.filename,
            js: {
                ast: bundleItem.ast
            },
            module: bundleItem.moduleName,
            source: bundleItem.source
        };
        async.eachSeries(transforms, (transform: Transform, onTransformApplied: ErrorCallback<Error>) => {
            process.nextTick(() => {
                transform(context, (error: Error, dirty: boolean) => {
                    this.handleError(error, transform);
                    if (dirty) {
                        bundleItem.ast = context.js.ast;
                        bundleItem.source = context.source;
                    }
                    onTransformApplied();
                });
            });
        }, onTransformsApplied);
    }

    private handleError(error: Error, transform: Transform): void {
        if (error) {
            let errorMessage = "Unable to run transform: " + os.EOL + os.EOL +
                transform + os.EOL + os.EOL +
                "callback error parameter: " + error + os.EOL;
            this.log.error(errorMessage);
            throw new Error(errorMessage);
        }
    }
}
